import camelCase = require('camel-case')
import { JSDOM, ConstructorOptions } from 'jsdom'
import MemoryFS = require('memory-fs')
import path = require('path')
import webpack = require('webpack')

import { WebpackDomtureConfig } from './config'
import { log } from './log'
import { injectScriptTag, url, extendJSDOM, isRelative, preloadScripts } from './util'
import { unpartial } from 'unpartial';
import { Domture } from './interfaces';

export async function createWebpackDomture(config: WebpackDomtureConfig): Promise<Domture> {
  const dom = createWebpackJSDOM(config.jsdomConstructorOptions)
  mixWebpack(dom, config)
  extendJSDOM(dom, config)
  preloadScripts(dom, config.preloadScripts, config.rootDir)

  return dom as Domture
}

function createWebpackJSDOM(givenOptions: Partial<ConstructorOptions> = {}) {
  const options = unpartial<ConstructorOptions>(givenOptions, {
    url,
    runScripts: 'dangerously'
  })
  return new JSDOM('', options)
}


function mixWebpack(jsdom: JSDOM, config: WebpackDomtureConfig) {
  const memfs = new MemoryFS()

  const result = jsdom as any
  result.import = function (identifier: string) {
    const varID = `__domture__${camelCase(identifier)}`
    const filename = `${varID}.js`
    const filePath = `/${filename}`
    if (result.window[varID])
      return Promise.resolve(result.window[varID])

    const webpackOptions = getWebpackOptions()
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
  }
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
