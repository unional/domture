# domture

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Codecov][codecov-image]][codecov-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[![Greenkeeper][greenkeeper-image]][greenkeeper-url]
[![Semantic Release][semantic-release-image]][semantic-release-url]

[![Visual Studio Code][vscode-image]][vscode-url]
[![Wallaby.js][wallaby-image]][wallaby-url]

`domture` allows you to load packages and scripts directly on a `jsdom` instance for testing purpose.

You can load `npm` packages as well as local files (by default relative to current working directory `.`).

`domture` supports two loaders: `systemjs` and `webpack`.

When using `systemjs`, it leveages `systemjs` magic to load any type of module files.
However, certain NodeJS resolution does not work currently, and also code coverage is not available.

When using `webpack`, it bundles the files you try to import with `webpack` and load them into `jsdom` through script tags.
The NodeJS resolution is complete and code coverage is (will be) available.
However, additional bundle time is needed and bundles management still need to be planned out and implemented in the future.
You also lost the magic from `systemjs`.

By default, `webpack` will be used as the default loader.

For projects using `webpack@4`, please use `domture@2`. For `webpack@3`, please use `domture@1`

## Usage

```ts
import { createDomture } from 'domture'

test('basic usage',async () => {
  const domture = await createDomture()

  // load package `foo`
  const foo = await domture.import('foo')

  // load by relative path
  const config = await domture.import('./config')
})

test('customize', async () => {
  const domture = await createDomture({
    // Where to resolve relative path.
    rootDir: './lib',
    // Preload some scripts ahead of time.
    preloadScripts: ['a-package', './someCode.js', './index'],
    // Able to load TypeScript code directly
    transpiler: 'typescript',
    // configure jsdom.
    // Can't set `url` and `runScripts`.
    // They are used internally.
    jsdomConstructorOptions: { ... }
  })
})
test('customize with webpack', async () => {
  const domture = await createDomture({
    /**
     * devtool, entry, and output are preserved
     */
    webpackConfig: {
      // ...
    }
  })
})

test('customize with systemjs', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    // Indicates which extension to try during `import()`
    // This is needed only if you need to do something special,
    // e.g. `allowJs` with TypeScirpt project.
    // By default, `domture` will look for 'js' and 'jsx` for JavaScript projects,
    // 'ts', 'tsx' for TypeScript projects.
    moduleFileExtensions: ['ts', 'js']
    systemjsConfig: {
      packages: {
        // This is need for some packages due to https://github.com/systemjs/systemjs/issues/1603
        'make-error': {
          main: 'index'
        }
      },
      meta: {
        // Do this if `some-global-script.js` is not detected correctly as global script when using `import()`.
        'some-global-script.js': {
          format: 'global'
        }
      }
    }
  })
})
```

## Contribute

```sh
# right after clone
npm install

# begin making changes
git checkout -b <branch>
npm run watch

# edit `webpack.config.es5.js` and `rollup.config.es2015.js` to exclude dependencies for the bundle if needed

# after making change(s)
git commit -m "<commit message>"
git push

# create PR
```

## Npm Commands

There are a few useful commands you can use during development.

```sh
# Run tests (and lint) automatically whenever you save a file.
npm run watch

# Run tests with coverage stats (but won't fail you if coverage does not meet criteria)
npm run test

# Manually verify the project.
# This will be ran during 'npm preversion' so you normally don't need to run this yourself.
npm run verify

# Build the project.
# You normally don't need to do this.
npm run build

# Run tslint
# You normally don't need to do this as `npm run watch` and `npm version` will automatically run lint for you.
npm run lint
```

Generated by [`unional-cli@0.0.0`](https://github.com/unional/unional-cli)

[npm-image]: https://img.shields.io/npm/v/domture.svg?style=flat
[npm-url]: https://npmjs.org/package/domture
[downloads-image]: https://img.shields.io/npm/dm/domture.svg?style=flat
[downloads-url]: https://npmjs.org/package/domture
[travis-image]: https://img.shields.io/travis/unional/domture/master.svg?style=flat
[travis-url]: https://travis-ci.org/unional/domture?branch=master
[codecov-image]: https://codecov.io/gh/unional/satisfier/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/unional/satisfier
[coveralls-image]: https://coveralls.io/repos/github/unional/domture/badge.svg
[coveralls-url]: https://coveralls.io/github/unional/domture
[greenkeeper-image]: https://badges.greenkeeper.io/unional/domture.svg
[greenkeeper-url]: https://greenkeeper.io/
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[wallaby-image]: https://img.shields.io/badge/wallaby.js-configured-green.svg
[wallaby-url]: https://wallabyjs.com
[vscode-image]: https://img.shields.io/badge/vscode-ready-green.svg
[vscode-url]: https://code.visualstudio.com/
