import fs = require('fs')
import fileUrl = require('file-url')
import { JSDOM, ConstructorOptions } from 'jsdom'
import path = require('path')
import { unpartial } from 'unpartial'

import { DomtureConfig, defaultConfig } from './config'
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
    config.preloadScripts.forEach(s => {
      domture.loadScript(s)
    })
    // return config.preloadScripts.reduce((prev, script) => {
    //   return prev.then(() => domture.import(script))
    // }, Promise.resolve()).then(() => domture)
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
    const scriptEL = this.window.document.createElement('script')
    scriptEL.textContent = loadScriptContent(identifier)
    this.window.document.head.appendChild(scriptEL)
  }
  function loadScriptContent(identifier: string) {
    let scriptPath = path.resolve(config.rootDir, identifier)
    log.debug(identifier, scriptPath)
    if (config.transpiler === 'typescript' && scriptPath.slice(-3) !== '.ts')
      scriptPath += '.ts'

    if (config.transpiler !== 'typescript' && scriptPath.slice(-3) !== '.js')
      scriptPath += '.js'
    return fs.readFileSync(scriptPath, 'utf8')
  }
  return result
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
