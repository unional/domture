import test from 'ava'
import path = require('path')

import { createDomture } from './index'

test('import cjs', async t => {
  const domture = await createDomture()
  const extend = await domture.import('deep-extend')
  t.is(typeof extend, 'function')
})

test('import es6', async t => {
  const domture = await createDomture()

  const globalStore = await domture.import('global-store')

  t.is(typeof globalStore, 'object')
  t.is(globalStore.default.name, 'create')
})

test('import relative with default srcRoot ("./src")', async t => {
  const domture = await createDomture({ transpiler: 'typescript' })

  const config = await domture.import('./log')
  t.truthy(config)
})

test('import relative', async t => {
  const domture = await createDomture({
    srcRoot: './fixtures/cjs'
  })
  const foo = await domture.import('./index')
  t.is(typeof foo, 'function')
})

test('load ts', async t => {
  const domture = await createDomture({
    srcRoot: './fixtures/ts',
    transpiler: 'typescript'
  })
  const m = await domture.import('./index')
  t.is(typeof m, 'object')

  const getLogger = await domture.import('./getLogger')
  t.is(getLogger.getLogger.name, 'getLogger')
})

test('with srcRoot should still load packages', async t => {
  const domture = await createDomture({
    srcRoot: './fixtures/ts',
    transpiler: 'typescript'
  })

  const globalStore = await domture.import('global-store')
  t.is(typeof globalStore, 'object')
  t.is(globalStore.default.name, 'create')
})

test('fix missing main', async t => {
  const domture = await createDomture({
    srcRoot: './fixtures/fix-main',
    systemjsConfig: {
      packages: {
        'make-error': {
          main: 'index'
        }
      }
    }
  })
  const m = await domture.import('./index')
  t.is(m.name, 'makeError')
})

test('use map', async t => {
  const domture = await createDomture({
    srcRoot: './fixtures/cjs',
    systemjsConfig: {
      map: {
        'xyz': './fixtures/cjs/index'
      }
    }
  })
  const foo = await domture.import('xyz')
  t.is(typeof foo, 'function')
  const foo2 = await domture.import('./index')
  t.is(foo, foo2)
})

test('preload script', async t => {
  const domture = await createDomture({
    preloadScripts: [
      path.resolve('./node_modules/global-store/dist/global-store.es5.js')
    ]
  })

  t.truthy(domture.window.GlobalStore)
})
