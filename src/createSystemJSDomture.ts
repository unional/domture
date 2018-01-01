import fs = require('fs')
import { JSDOM, ConstructorOptions } from 'jsdom'
import { unpartial } from 'unpartial'

import { SystemJSDomtureConfig } from './config'
import { toSystemJSModuleName, configureSystemJS } from './configureSystemJS'
import { extendJSDOM } from './extendJSDOM'
import { SystemJSDomture } from './interfaces'
import { log } from './log'
import { url, preloadScripts } from './util'

export async function createSystemJSDomture(config: SystemJSDomtureConfig): Promise<SystemJSDomture> {
  const dom = createSystemJSJSDOM(config.jsdomConstructorOptions)
  mixSystemJS(dom)
  extendJSDOM(dom, config)

  configureSystemJS(dom, config)
  preloadScripts(dom, config.preloadScripts, config.rootDir)

  return dom as SystemJSDomture
}
export function createSystemJSJSDOM(givenOptions: Partial<ConstructorOptions> = {}) {
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
export function mixSystemJS(dom: JSDOM) {
  const result = dom as any
  const systemjs = result.systemjs = result.window.SystemJS as SystemJSLoader.System

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
}
