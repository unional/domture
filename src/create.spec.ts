import test from 'ava'
import path = require('path')

import { create } from './index'

test('import cjs', async t => {
  const domture = await create()
  const extend = await domture.import('deep-extend')
  t.is(typeof extend, 'function')
})

test('import es6', async t => {
  const domture = await create()

  const globalStore = await domture.import('global-store')

  t.is(typeof globalStore, 'object')
  t.is(globalStore.default.name, 'create')
})

test('import relative with default', async t => {
  const domture = await create({ writtenIn: 'ts' })

  const config = await domture.import('./log')
  t.truthy(config)
})

test('import relative', async t => {
  const domture = await create({
    srcRoot: './fixtures/cjs'
  })
  const foo = await domture.import('./index')
  t.is(typeof foo, 'function')
})

test('load ts', async t => {
  const domture = await create({
    srcRoot: './fixtures/ts',
    writtenIn: 'ts'
  })
  const m = await domture.import('./index')
  t.is(typeof m, 'object')

  const getLogger = await domture.import('./getLogger')
  t.is(getLogger.getLogger.name, 'getLogger')
})

test('fix missing main', async t => {
  const domture = await create({
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
  const domture = await create({
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
  const domture = await create({
    preloadScripts: [
      path.resolve('./node_modules/global-store/dist/global-store.es5.js')
    ]
  })

  t.truthy(domture.window.GlobalStore)
})
