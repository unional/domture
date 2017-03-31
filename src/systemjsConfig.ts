import extend = require('deep-extend')

import { Config } from './interfaces'

const baseMap = {
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

const writtenInMap = {
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
  let sys: any = baseMap[config.packageManager]()
  extend(sys, writtenInMap[config.writtenIn](config.srcRoot))
  extend(sys.packages, config.packages)

  return sys
}
