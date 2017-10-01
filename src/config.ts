import extend = require('deep-extend')

import { Config } from './interfaces'

export const defaultConfig: Config = {
  packageManager: 'npm',
  srcRoot: './src',
  transpiler: 'none'
}

export function unpartial(config?: Partial<Config>): Config {
  return extend({}, defaultConfig, config)
}
