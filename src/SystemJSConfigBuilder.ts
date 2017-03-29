import extend = require('deep-extend')
const configMap = {
  npm: {
    paths: {
      'npm:': './node_modules/'
    },
    baseURL: '/',
    packageConfigPaths: [
      'npm:@*/*/package.json',
      'npm:*/package.json'
    ]
  },
  ts: {
    packages: {
      'ts': {
        'main': 'plugin.js'
      },
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
      'ts': './node_modules/plugin-typescript/lib',
      'typescript': './node_modules/typescript'
    },
    transpiler: 'ts'
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
