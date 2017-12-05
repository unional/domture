import { log } from './log'
import { toSystemJSConfig } from './systemjsConfig'

export function configureSystemJS(domture, config) {
  const sysConfig = toSystemJSConfig(config)
  // istanbul ignore next
  log.onDebug(log => log('SystemJS configuration:', JSON.stringify(sysConfig)))
  domture.systemjs.config(sysConfig)

  // When loading systemjs inside jsdom,
  // `systemjs._nodeRequire` is undefined.
  // Setting it to give `plugin.ts` access to all node modules.
  domture.systemjs._nodeRequire = require
  domture.systemjs.domtureConfig = config
}


export function toSystemJSModuleName(identifier: string) {
  return isRelative(identifier) ? identifier.replace('.', 'app') : identifier
}

function isRelative(identifier: string) {
  return identifier.indexOf('.') === 0
}
