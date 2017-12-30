import camelCase = require('camel-case')
import fs = require('fs')
import fileUrl = require('file-url')
import { JSDOM, ConstructorOptions, DOMWindow } from 'jsdom'
import MemoryFS = require('memory-fs')
import path = require('path')
import { unpartial } from 'unpartial'
import webpack = require('webpack')

import { DomtureConfig, defaultConfig } from './config'
import { Domture } from './interfaces'
import { log } from './log'

const url = fileUrl(process.cwd()) + '/'

export async function createDomture(givenConfig: Partial<DomtureConfig> = {}): Promise<Domture> {
  const config = unpartial(defaultConfig, givenConfig)
  const dom = createJSDOM(config.jsdomConstructorOptions)
  const domture = extendJSDOM(dom, config)

  if (config.preloadScripts) {
    config.preloadScripts.forEach(s => loadScriptSync(domture.window, config.rootDir, s))
  }
  return domture
}

function createJSDOM(givenOptions: Partial<ConstructorOptions> = {}) {
  const options = unpartial<ConstructorOptions>(givenOptions, {
    url,
    runScripts: 'dangerously'
  })
  return new JSDOM('', options)
}

function extendJSDOM(dom: JSDOM, config: DomtureConfig): Domture {
  const memfs = new MemoryFS()

  const result = dom as any
  result.import = function (identifier: string) {
    const varID = `__domture__${camelCase(identifier)}`
    const filename = `${varID}.js`
    const filePath = `/${filename}`
    if (memfs.existsSync(filePath))
      return Promise.resolve(result.window[varID])

    const webpackOptions = getWebpackOptions()

    function getWebpackOptions() {
      const options: webpack.Configuration = {
        entry: config.transpiler === 'typescript' ?
          resolveTSID(config.rootDir, identifier) :
          resolveID(config.rootDir, identifier),
        output: {
          path: '/',
          filename,
          library: varID
        }
      }
      if (config.transpiler === 'typescript') {
        options.devtool = 'source-map'
        options.resolve = {
          extensions: ['.ts', '.tsx', '.js', '.jsx']
        }
        options.module = {
          rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }]
        }
      }
      return options
    }

    return new Promise<string>((a, r) => {
      const compiler = webpack(webpackOptions)
      compiler.outputFileSystem = memfs
      compiler.run((err, stats) => {
        if (err)
          r(err)
        else if (stats.hasErrors()) {
          r(stats.toJson().errors)
        }
        else {
          if (stats.hasWarnings())
            log.warn(stats.toJson().warnings)
          const content = memfs.readFileSync(filePath, 'utf8')
          a(content)
        }
      })
    }).then(source => {
      injectScriptTag(result.window, source)
      return result.window[varID]
    })
  }

  result.loadScript = function (this: Domture, identifier: string) {
    return loadScript(this.window, config.rootDir, identifier)
  }

  result.loadScriptSync = function (this: Domture, identifier: string) {
    loadScriptSync(this.window, config.rootDir, identifier)
  }

  return result
}

function resolveID(baseDir, id) {
  if (isRelative(id))
    return resolveRelative(baseDir, id)
  return id
}

function resolveTSID(baseDir, id) {
  // of course this does not work with '.tsx' file.
  // but...will fix it by then.
  if (isRelative(id))
    return resolveRelative(baseDir, id)
  return id
}

function isRelative(id: string) {
  return id.startsWith('.')
}

function resolveRelative(from: string, to: string) {
  const froms = path.resolve(from).split('/')
  const tos = to.split('/')
  while (tos[0].startsWith('.')) {
    if (tos[0] === '.')
      tos.shift()
    else if (tos[0] === '..') {
      froms.pop()
      tos.shift()
    }
    else
      break;
  }
  return froms.concat(tos).join('/')
}

function loadScript(window: DOMWindow, rootDir: string, identifier: string) {
  return loadScriptContent(rootDir, identifier)
    .then(content => {
      injectScriptTag(window, content)
    })
}

function loadScriptContent(rootDir: string, identifier: string) {
  const scriptPath = resolveScriptPath(rootDir, identifier)
  return new Promise<string>((a, r) => {
    fs.readFile(scriptPath, { encoding: 'utf8' }, (err, data) => {
      if (err) r(err)
      a(data)
    })
  })
}

function loadScriptSync(window: DOMWindow, rootDir: string, identifier: string) {
  const content = loadScriptContentSync(rootDir, identifier)
  injectScriptTag(window, content)
}

function loadScriptContentSync(rootDir: string, identifier: string) {
  const scriptPath = resolveScriptPath(rootDir, identifier)
  return fs.readFileSync(scriptPath, 'utf8')
}

function resolveScriptPath(rootDir: string, identifier: string) {
  let scriptPath = path.resolve(rootDir, identifier)
  if (scriptPath.slice(-3) !== '.js')
    scriptPath += '.js'
  return scriptPath
}

function injectScriptTag(window: DOMWindow, scriptContent: string) {
  const scriptEL = window.document.createElement('script')
  scriptEL.textContent = scriptContent
  window.document.head.appendChild(scriptEL)
}
