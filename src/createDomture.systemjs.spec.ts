import t from 'assert'
import a from 'assertron'

import { createDomture } from './index'

test('import cjs', async () => {
  const domture = await createDomture({
    loader: 'systemjs'
  })
  const makeError = await domture.import('make-error')
  t.strictEqual(typeof makeError, 'function')
})

test('import es6', async () => {
  const domture = await createDomture({
    loader: 'systemjs'
  })

  const globalStore = await domture.import('global-store')

  t.strictEqual(typeof globalStore, 'object')
  t.strictEqual(globalStore.default.name, 'createStore')
})

test('import relative with default rootDir (".")', async () => {
  const domture = await createDomture({
    loader: 'systemjs'
  })

  const foo = await domture.import('./fixtures/cjs/foo.js')
  t.notStrictEqual(foo, undefined)
})

test('import relative', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/cjs'
  })
  const foo = await domture.import('./index')
  t.strictEqual(typeof foo, 'function')
})

test('fix missing main', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
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
  t.strictEqual(m.name, 'makeError')
})

test('use map', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/cjs',
    systemjsConfig: {
      map: {
        'xyz': './fixtures/cjs/index'
      }
    }
  })
  const foo = await domture.import('xyz')
  t.strictEqual(typeof foo, 'function')
  const foo2 = await domture.import('./index')
  t.strictEqual(foo, foo2)
})

test('preload script', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    preloadScripts: [
      require.resolve('global-store/dist/global-store.es5.js')
    ]
  })

  t.notStrictEqual(domture.window.GlobalStore, undefined)
})

test('preload color-map script', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    preloadScripts: [
      require.resolve('color-map/dist/color-map.es5.js')
    ]
  })
  t.notStrictEqual(domture.window.ColorMap, undefined)
})

test('import color-map module', async () => {
  const domture = await createDomture()

  const colorMap = await domture.import('color-map')

  t.notStrictEqual(colorMap, undefined)
})

test('import global-store script file should fill global namespace', async () => {
  const harness = await createDomture({ loader: 'systemjs' })
  await harness.import('./node_modules/global-store/dist/global-store.es5.js')

  t.notStrictEqual(harness.window.GlobalStore, undefined)
})

test('import color-map script file should fill global namespace', async () => {
  const harness = await createDomture({ loader: 'systemjs' })
  await harness.import(require.resolve('color-map/dist/color-map.es5.js'))

  t.notStrictEqual(harness.window.ColorMap, undefined)
})

test('preloadScripts should fill global namespace', async () => {
  const harness = await createDomture(
    {
      loader: 'systemjs',
      rootDir: '.',
      preloadScripts: [
        './node_modules/global-store/dist/global-store.es5.js'
      ]
    })
  t.notStrictEqual(harness.window.GlobalStore, undefined)
})

test('preloadScripts should run sequentially', async () => {
  const harness = await createDomture(
    {
      loader: 'systemjs',
      rootDir: './fixtures/global-deps',
      preloadScripts: [
        './foo.js',
        './boo.js'
      ]
    })

  t.notStrictEqual(harness.window.boo, undefined)
  t.strictEqual(harness.window.boo.boo, 1)
})

test(`using jsdom constructor options`, async () => {
  let actual
  await createDomture({
    loader: 'systemjs',
    jsdomConstructorOptions: {
      beforeParse(window) {
        actual = window
      }
    }
  })
  t.notStrictEqual(actual, undefined)
})

test(`loadScript() with relative path`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })
  await domture.loadScript('./foo')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScript() with relative path with extension`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })
  await domture.loadScript('./foo.js')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScript() with absolute path`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })

  await domture.loadScript(require.resolve('color-map/dist/color-map.es5.js'))

  t.notStrictEqual(domture.window.ColorMap, undefined)
})

test(`loadScript() with invalid path`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })

  const err = await a.throws<any>(domture.loadScript('./a.js'))
  t.strictEqual(err.code, 'ENOENT')
})

test.only(`loadScriptSync() with relative path`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })
  domture.loadScriptSync('./foo')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScriptSync() with relative path with extension`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })
  domture.loadScriptSync('./foo.js')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScriptSync() with absolute path`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })

  domture.loadScriptSync(require.resolve('color-map/dist/color-map.es5.js'))

  t.notStrictEqual(domture.window.ColorMap, undefined)
})

test(`loadScriptSync() with invalid path`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-deps'
  })

  const err = a.throws<any>(() => domture.loadScriptSync('./a.js'))
  t.strictEqual(err.code, 'ENOENT')
})

test(`User metadata to override format detection`, async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/global-detection',
    systemjsConfig: {
      meta: {
        'color-map.js': {
          format: 'global'
        }
      }
    }
  })

  await domture.import('./color-map.js')
  t.notStrictEqual(domture.window.ColorMap, undefined)
})
