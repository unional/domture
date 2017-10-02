import fs = require('fs')
import fileUrl = require('file-url')
import { JSDOM } from 'jsdom'
import { unpartial } from 'unpartial'


import { DomtureConfig, defaultConfig } from './config'
import { Domture } from './interfaces'
import { log } from './log'

import { toSystemJSConfig } from './systemjsConfig'

const url = fileUrl(process.cwd()) + '/'

export function createDomture(givenConfig?: Partial<DomtureConfig>): Promise<Domture> {
  const config = unpartial(givenConfig, defaultConfig)
  const sysConfig = toSystemJSConfig(config)

  // Add `console.debug` to NodeJS environment.
  // so that debug message can be written
  console.debug = console.debug || console.log

  const dom = createJSDOM()
  const domture = extendJSDOM(dom)
  domture.systemjs.config(sysConfig)

  if (config.preloadScripts) {
    return Promise.all(config.preloadScripts.map(s => {
      return domture.import(s)
    })).then(() => domture)
  }
  return Promise.resolve(domture)
}

function createJSDOM() {
  const systemJSScript = readSystemJSScript()

  return new JSDOM(`<script>${systemJSScript}</script>`, {
    url,
    runScripts: 'dangerously'
  })
}

function readSystemJSScript() {
  return fs.readFileSync(require.resolve('systemjs'), 'utf8')
}

function extendJSDOM(dom: JSDOM): Domture {
  const result = dom as any
  const systemjs = result.systemjs = result.window.SystemJS as SystemJSLoader.System

  result.import = function (identifier: string) {
    const moduleName = toSystemJSModuleName(identifier)
    log.debug(`Import ${identifier} as ${moduleName}`)
    return systemjs.import(moduleName)
  }

  return result
}

function toSystemJSModuleName(identifier) {
  return isRelative(identifier) ? identifier.replace('.', 'app') : identifier
}

function isRelative(identifier: string) {
  return identifier.indexOf('.') === 0
}
