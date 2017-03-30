import extend = require('deep-extend')
const configMap = {
  npm: {
    baseURL: 'node_modules',
    packageConfigPaths: [
      '@*/*/package.json',
      '*/package.json'
    ]
  },
  ts: {
    packages: {
      'typescript': {
        'main': 'lib/typescript.js',
        'meta': {
          'lib/typescript.js': {
            'exports': 'ts'
          }
        }
      }
    },
    map: {
      'plugin-typescript': './node_modules/plugin-typescript/lib/plugin.js',
      'typescript': './node_modules/typescript'
    },
    transpiler: 'plugin-typescript'
  }
}

export class SystemJSConfigBuilder {

  private features: string[]
  constructor(baseType: 'npm' | 'jspm' = 'npm') {
    this.features = [baseType]
  }
  useTypeScript() {
    this.features.push('ts')
  }
  build() {
    return this.features.reduce((p, f) => {
      return extend(p, configMap[f])
    }, {})
  }
}
