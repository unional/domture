import { unpartialRecursively } from 'unpartial'

import { DomtureConfig } from './config'

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
    // istanbul ignore next
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
  none(rootDir: string) {
    return {
      map: {
        'app': rootDir
      },
      packages: {
        'app': {
          defaultExtension: 'js'
        }
      }
    }
  },
  typescript(rootDir: string) {
    return {
      map: {
        'app': rootDir
      },
      packages: {
        'app': {
          defaultExtension: false,
          meta: {
            '*': {
              loader: 'one-plugin',
              oneOptions: {
                meta: {
                  '*.ts': {
                    loader: 'plugin-typescript'
                  },
                  '*.js': {},
                  '*.tsx': {
                    loader: 'plugin-typescript'
                  }
                }
              }
            }
          }
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
      transpiler: 'plugin-typescript',
      typescriptOptions: {
        jsx: 'react'
      }
    }
  }
}

export function toSystemJSConfig(config: DomtureConfig) {
  const { systemjsConfig = {} } = config
  let sys: any = packageManagers[config.packageManager]()

  sys = unpartialRecursively(sys, transpilerBuilders[config.transpiler](config.rootDir))
  sys = unpartialRecursively(sys, systemjsConfig)
  fixMeta(sys, systemjsConfig.meta)

  if (config.explicitExtension)
    sys.packages.app.defaultExtension = ''

  return sys
}

/**
 * When using meta, user declare them based off the `rootDir`.
 * It is mapped to `app/*` so need to adjust the keys accordingly.
 */
function fixMeta(sys, meta) {
  if (meta) {
    sys.meta = {}
    Object.keys(meta).forEach(k => {
      sys.meta[`app/${k}`] = meta![k]
    })
  }
}
