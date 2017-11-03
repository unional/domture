import test from 'ava'

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
      require.resolve('global-store/dist/global-store.es5.js')
    ]
  })

  t.not(domture.window.GlobalStore, undefined)
})

test('preload color-map script', async t => {
  const domture = await createDomture({
    preloadScripts: [
      require.resolve('color-map/dist/color-map.es5.js')
    ]
  })
  t.not(domture.window.ColorMap, undefined)
})

test('import color-map still works', async t => {
  const domture = await createDomture()

  const colorMap = await domture.import('color-map')

  t.not(colorMap, undefined)
})

test('import global-store should fill global namespace', async t => {
  const harness = await createDomture()
  await harness.import('./node_modules/global-store/dist/global-store.es5.js')

  t.not(harness.window.GlobalStore, undefined)
})

test('import `color-map` should fill global namespace', async t => {
  const harness = await createDomture()
  await harness.import(require.resolve('color-map/dist/color-map.es5.js'))

  t.not(harness.window.ColorMap, undefined)
})

test('preloadScripts should fill global namespace', async t => {
  const harness = await createDomture(
    {
      rootDir: '.',
      preloadScripts: [
        './node_modules/global-store/dist/global-store.es5.js'
      ]
    })

  t.not(harness.window.GlobalStore, undefined)
})
