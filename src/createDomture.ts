import fs = require('fs')
import fileUrl = require('file-url')

import { JSDOM } from 'jsdom'

import { unpartial } from './config'
import { Domture, DomtureConfig } from './interfaces'
import { toSystemJSConfig } from './systemjsConfig'

const url = fileUrl(process.cwd()) + '/'

export function createDomture(partialConfig?: Partial<DomtureConfig>): Promise<Domture> {
  const config = unpartial(partialConfig)
  const sysConfig = toSystemJSConfig(config)

  // Add `console.debug` to NodeJS environment.
  // so that debug message can be written
  console.debug = console.debug || console.log

  const dom = createJSDOM()
  const { window } = dom
  const systemjs = (window as any).SystemJS
  systemjs.config(sysConfig)

  const domture = extendJSDOM(dom)
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
  result.systemjs = result.window.SystemJS

  result.import = function (identifier: string) {
    const id = isRelative(identifier) ?
      identifier.replace('.', 'app') : identifier
    return result.systemjs.import(id)
  }

  return result
}

function isRelative(identifier: string) {
  return identifier.indexOf('.') === 0
}
