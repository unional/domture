import fs = require('fs')
import fileUrl = require('file-url')

import { JSDOM } from 'jsdom'

import { unpartial } from './config'
import { Domture, Config } from './interfaces'
import { DomtureImpl } from './DomtureImpl'
import { toSystemJSConfig } from './systemjsConfig'

const url = fileUrl(process.cwd()) + '/'

export function create(partialConfig?: Partial<Config>): Promise<Domture> {
  const config = unpartial(partialConfig)
  const sysConfig = toSystemJSConfig(config)

  // Add `console.debug` to NodeJS environment.
  // so that debug message can be written
  console.debug = console.debug || console.log

  const dom = createJSDOM()
  const { window } = dom
  const systemjs = (window as any).SystemJS
  systemjs.config(sysConfig)

  const domture = new DomtureImpl(window)
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
  return fs.readFileSync(require.resolve('systemjs/dist/system.js'), 'utf8')
}
