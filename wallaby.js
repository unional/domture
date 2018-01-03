module.exports = function (wallaby) {
  return {
    "files": [
      { pattern: 'tsconfig.*', instrument: false },
      { pattern: 'fixtures/**', instrument: false },
      "src/**/*.ts",
      "!src/**/*.spec.ts",
      { pattern: 'node_modules/@unional/logging/**', instrument: false },
      { pattern: 'node_modules/aurelia-logging/**', instrument: false },
      { pattern: 'node_modules/color-map/**', instrument: false },
      { pattern: 'node_modules/global-store/**', instrument: false },
      { pattern: 'node_modules/istanbul-instrumenter-loader/**', instrument: false },
      { pattern: 'node_modules/make-error/**', instrument: false },
      { pattern: 'node_modules/plugin-typescript/**', instrument: false },
      { pattern: 'node_modules/systemjs-plugin-domture/**', instrument: false },
      { pattern: 'node_modules/ts-loader/**', instrument: false },
      { pattern: 'node_modules/typescript/**', instrument: false }
    ],
    "tests": [
      "src/**/*.spec.ts"
    ],
    "env": {
      "type": "node"
    },
    compilers: {
      'src/**/*.ts': wallaby.compilers.typeScript({ module: 'commonjs' }),
    },
    testFramework: 'ava'
  }
}
