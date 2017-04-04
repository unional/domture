import extend = require('deep-extend')

import { Config } from './interfaces'

export const defaultConfig: Config = {
  map: {},
  packageManager: 'npm',
  packages: {},
  scripts: [],
  srcRoot: './src',
  writtenIn: 'es5'
}

export function unpartial(config?: Partial<Config>): Config {
  return extend({}, defaultConfig, config)
}
