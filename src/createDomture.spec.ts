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

test('import relative with default rootDir (".")', async t => {
  const domture = await createDomture({ transpiler: 'typescript' })

  const config = await domture.import('./src/log')
  t.truthy(config)
})

test('import relative', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/cjs'
  })
  const foo = await domture.import('./index')
  t.is(typeof foo, 'function')
})

test('load ts', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })
  const m = await domture.import('./index')
  t.is(typeof m, 'object')

  const getLogger = await domture.import('./getLogger')
  t.is(getLogger.getLogger.name, 'getLogger')
})

test('with rootDir should still load packages', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })

  const globalStore = await domture.import('global-store')
  t.is(typeof globalStore, 'object')
  t.is(globalStore.default.name, 'create')
})

test('fix missing main', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/fix-main',
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
    rootDir: './fixtures/cjs',
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

test('import should fill global namespace', async t => {
  const harness = await createDomture()
  await harness.import('./node_modules/global-store/dist/global-store.es5.js')
  const store = harness.window.GlobalStore

  t.truthy(store)
})

test('import global namespace script', async t => {
  const harness = await createDomture({ transpiler: 'typescript' })
  await harness.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = harness.window.MyCompany.component.TextBox
  t.deepEqual(textBox, { a: 1 })
})

test(`preload global namespace script`, async t => {
  const harness = await createDomture({
    transpiler: 'typescript',
    preloadScripts: ['./fixtures/ts-global/MyCompany/component/TextBox']
  })
  const textBox = harness.window.MyCompany.component.TextBox
  t.deepEqual(textBox, { a: 1 })
})

test('preloadScripts should fill global namespace', async t => {
  const harness = await createDomture(
    {
      rootDir: '.',
      preloadScripts: [
        './node_modules/global-store/dist/global-store.es5.js'
      ]
    })

  const store = harness.window.GlobalStore
  t.truthy(store)
})
