import extend = require('deep-extend')

import { DomtureConfig } from './interfaces'

const packageManagers = {
  npm() {
    return {
      baseURL: 'node_modules',
      packageConfigPaths: [
        '@*/*/package.json',
        '*/package.json'
      ]
    }
  },
  jspm() {
    return {
      browserConfig: {
        baseURL: '/'
      },
      paths: {
        'github:': 'jspm_packages/github/',
        'npm:': 'jspm_packages/npm/'
      }
    }
  }
}

const transpilerBuilders = {
  none(srcRoot: string) {
    return {
      map: {
        'app': srcRoot
      },
      packages: {
        'app': {
          defaultExtension: 'js'
        }
      }
    }
  },
  typescript(srcRoot: string) {
    return {
      map: {
        'app': srcRoot
      },
      packages: {
        'app': {
          defaultExtension: 'ts'
        },
        'typescript': {
          'main': 'lib/typescript.js',
          'meta': {
            'lib/typescript.js': {
              'exports': 'ts'
            }
          }
        },
        'plugin-typescript': {
          'main': 'lib/plugin.js'
        }
      },
      transpiler: 'plugin-typescript'
    }
  }
}

export function toSystemJSConfig(config: DomtureConfig) {
  const { systemjsConfig = {} } = config
  let sys: any = packageManagers[config.packageManager]()

  extend(sys, transpilerBuilders[config.transpiler](config.srcRoot))
  extend(sys.packages, systemjsConfig.packages)
  extend(sys.map, systemjsConfig.map)

  return sys
}
