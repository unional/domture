import { JSDOM } from 'jsdom'

import { DomtureConfig } from './config'
import { Domture } from './interfaces'
import { getNamespace, loadScript, loadScriptSync } from './util'

export function extendJSDOM(dom: JSDOM, config: DomtureConfig) {
  const domture = dom as any

  domture.get = function (this: Domture, ns: string) {
    return getNamespace(this.window, ns)
  }
  domture.loadScript = function (this: Domture, identifier: string) {
    return loadScript(this.window, config.rootDir, identifier)
  }

  domture.loadScriptSync = function (this: Domture, identifier: string) {
    loadScriptSync(this.window, config.rootDir, identifier)
  }
}
