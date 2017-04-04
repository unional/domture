import extend = require('deep-extend')

import { Config } from './interfaces'

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

const writtenIn = {
  es5(srcRoot: string) {
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
  ts(srcRoot: string) {
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

export function toSystemJSConfig(config: Config) {
  let sys: any = packageManagers[config.packageManager]()

  extend(sys, writtenIn[config.writtenIn](config.srcRoot))
  extend(sys.packages, config.packages)
  extend(sys.map, config.map)

  return sys
}
