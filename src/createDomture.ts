import fs = require('fs')
import fileUrl = require('file-url')
import { JSDOM, ConstructorOptions } from 'jsdom'
import path = require('path')
import { unpartial } from 'unpartial'

import { DomtureConfig, defaultConfig, Transpiler } from './config'
import { Domture } from './interfaces'
import { log } from './log'

import { toSystemJSConfig } from './systemjsConfig'

const url = fileUrl(process.cwd()) + '/'

export function createDomture(givenConfig: Partial<DomtureConfig> = {}): Promise<Domture> {
  const config = unpartial(defaultConfig, givenConfig)
  const dom = createJSDOM(config.jsdomConstructorOptions)
  const domture = extendJSDOM(dom, config)

  configureSystemJS(domture, config)

  if (config.preloadScripts) {
    config.preloadScripts.forEach(s => domture['loadScriptSyncInternal']('none', config.rootDir, s))
  }
  return Promise.resolve(domture)
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

  result.import = function (identifier: string) {
    const startTick = process.hrtime()
    const moduleName = toSystemJSModuleName(identifier)
    log.onDebug(log => log(`Import ${identifier} as ${moduleName}`))
    return systemjs.import(moduleName).then(m => {
      const [second, nanoSecond] = process.hrtime(startTick)
      log.onDebug(log => log(`Import completed for ${identifier} (${second * 1000 + nanoSecond / 1e6} ms)`))
      return m
    })
  }

  result.loadScript = function (this: Domture, identifier: string) {
    return loadScriptContent(identifier)
      .then(content => {
        const scriptEL = this.window.document.createElement('script')
        scriptEL.textContent = content
        this.window.document.head.appendChild(scriptEL)
      })
  }
  result.loadScriptSync = function (this: Domture, identifier: string) {
    this['loadScriptSyncInternal'](config.transpiler, config.rootDir, identifier)
  }

  result.loadScriptSyncInternal = function (this: Domture, transpiler: Transpiler, rootDir: string, identifier: string) {
    const scriptEL = this.window.document.createElement('script')
    scriptEL.textContent = loadScriptContentSync(transpiler, rootDir, identifier)
    this.window.document.head.appendChild(scriptEL)
  }
  return result

  function loadScriptContent(identifier: string) {
    const scriptPath = resolveScriptPath(config.transpiler, config.rootDir, identifier)
    return new Promise<string>((a, r) => {
      fs.readFile(scriptPath, { encoding: 'utf8' }, (err, data) => {
        if (err)
          r(err)
        a(data)
      })
    })
  }

  function loadScriptContentSync(transpiler: Transpiler, rootDir: string, identifier: string) {
    const scriptPath = resolveScriptPath(transpiler, rootDir, identifier)
    return fs.readFileSync(scriptPath, 'utf8')
  }

  function resolveScriptPath(transpiler: Transpiler, rootDir: string, identifier: string) {
    let scriptPath = path.resolve(rootDir, identifier)
    if (transpiler === 'typescript' && scriptPath.slice(-3) !== '.ts')
      scriptPath += '.ts'

    if (transpiler === 'none' && scriptPath.slice(-3) !== '.js')
      scriptPath += '.js'
    return scriptPath
  }
}

function configureSystemJS(domture, config) {
  const sysConfig = toSystemJSConfig(config)
  log.onDebug(log => log('SystemJS configuration:', JSON.stringify(sysConfig)))
  domture.systemjs.config(sysConfig)
}

function toSystemJSModuleName(identifier: string) {
  return isRelative(identifier) ? identifier.replace('.', 'app') : identifier
}

function isRelative(identifier: string) {
  return identifier.indexOf('.') === 0
}
