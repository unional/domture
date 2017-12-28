import fs = require('fs')
import fileUrl = require('file-url')
import { JSDOM, ConstructorOptions, DOMWindow } from 'jsdom'
import path = require('path')
import { unpartial } from 'unpartial'

import { DomtureConfig, defaultConfig } from './config'
import { configureSystemJS, toSystemJSModuleName } from './configureSystemJS'
import { Domture } from './interfaces'
import { log } from './log'

const url = fileUrl(process.cwd()) + '/'

export async function createDomture(givenConfig: Partial<DomtureConfig> = {}): Promise<Domture> {
  const config = unpartial(defaultConfig, givenConfig)
  const dom = createJSDOM(config.jsdomConstructorOptions)
  const domture = extendJSDOM(dom, config)

  configureSystemJS(domture, config)

  if (config.preloadScripts) {
    config.preloadScripts.forEach(s => loadScriptSync(domture.window, true, config.rootDir, s))
  }
  return domture
}

function createJSDOM(givenOptions: Partial<ConstructorOptions> = {}) {
  const systemJSScript = readSystemJSScript()
  const options = unpartial<ConstructorOptions>(givenOptions, {
    url,
    runScripts: 'dangerously'
  })
  return new JSDOM(`<script>${systemJSScript}</script>`, options)
}

function readSystemJSScript() {
  return fs.readFileSync(require.resolve('systemjs'), 'utf8')
}

function extendJSDOM(dom: JSDOM, config: DomtureConfig): Domture {
  const result = dom as any
  const systemjs = result.systemjs = result.window.SystemJS as SystemJSLoader.System

  result.nodeImport = function (identifier: string) {
    const startTick = process.hrtime()
    const id = resolveID(config.rootDir, identifier)
    // istanbul ignore next
    log.onDebug(log => log(`NodeImport ${identifier} as ${id}`))
    const m = require(id)
    const [second, nanoSecond] = process.hrtime(startTick)
    // istanbul ignore next
    log.onDebug(log => log(`NodeImport completed for ${identifier} (${second * 1000 + nanoSecond / 1e6} ms)`))
    return m
  }
  function resolveID(baseDir, id) {
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

  result.import = function (identifier: string) {
    const startTick = process.hrtime()
    const moduleName = toSystemJSModuleName(identifier)

    // istanbul ignore next
    log.onDebug(log => log(`Import ${identifier} as ${moduleName}`))
    return systemjs.import(moduleName).then(m => {
      const [second, nanoSecond] = process.hrtime(startTick)
      // istanbul ignore next
      log.onDebug(log => log(`Import completed for ${identifier} (${second * 1000 + nanoSecond / 1e6} ms)`))
      return m
    })
  }

  result.loadScript = function (this: Domture, identifier: string) {
    return loadScript(this.window, config.explicitExtension, config.rootDir, identifier)
  }

  result.loadScriptSync = function (this: Domture, identifier: string) {
    loadScriptSync(this.window, config.explicitExtension, config.rootDir, identifier)
  }

  return result
}
function loadScript(window: DOMWindow, explicitExtension: boolean | undefined, rootDir: string, identifier: string) {
  return loadScriptContent(explicitExtension, rootDir, identifier)
    .then(content => {
      injectScriptTag(window, content)
    })
}

function loadScriptContent(explicitExtension: boolean | undefined, rootDir: string, identifier: string) {
  const scriptPath = resolveScriptPath(explicitExtension || false, rootDir, identifier)
  return new Promise<string>((a, r) => {
    fs.readFile(scriptPath, { encoding: 'utf8' }, (err, data) => {
      if (err) r(err)
      a(data)
    })
  })
}

function loadScriptSync(window: DOMWindow, explicitExtension: boolean | undefined, rootDir: string, identifier: string) {
  const content = loadScriptContentSync(explicitExtension, rootDir, identifier)
  injectScriptTag(window, content)
}

function loadScriptContentSync(explicitExtension: boolean | undefined, rootDir: string, identifier: string) {
  const scriptPath = resolveScriptPath(explicitExtension, rootDir, identifier)
  return fs.readFileSync(scriptPath, 'utf8')
}

function resolveScriptPath(explicitExtension: boolean | undefined, rootDir: string, identifier: string) {
  let scriptPath = path.resolve(rootDir, identifier)
  if (!explicitExtension && scriptPath.slice(-3) !== '.js')
    scriptPath += '.js'
  return scriptPath
}

function injectScriptTag(window: DOMWindow, scriptContent: string) {
  const scriptEL = window.document.createElement('script')
  scriptEL.textContent = scriptContent
  window.document.head.appendChild(scriptEL)
}
