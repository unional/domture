import extend = require('deep-extend')

import { DomtureConfig } from './interfaces'

export const defaultConfig: DomtureConfig = {
  packageManager: 'npm',
  srcRoot: './src',
  transpiler: 'none'
}

export function unpartial(config?: Partial<DomtureConfig>): DomtureConfig {
  return extend({}, defaultConfig, config)
}
