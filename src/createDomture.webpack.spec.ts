import t from 'assert';
import a from 'assertron';
import { createDomture } from './index';


test('import cjs', async () => {
  const domture = await createDomture()
  const makeError = await domture.import('make-error')
  t.strictEqual(typeof makeError, 'function')
})

test('import es6', async () => {
  const domture = await createDomture()

  const globalStore = await domture.import('global-store')

  t.strictEqual(typeof globalStore, 'object')
  t.strictEqual(globalStore.default.name, 'createStore')
})

test('import relative with default rootDir (".")', async () => {
  const domture = await createDomture()

  const foo = await domture.import('./fixtures/cjs/foo.js')
  t.notStrictEqual(foo, undefined)
  t.strictEqual(foo(), 'foo')

  // the loaded version will be cached and returned
  const foo2 = await domture.import('./fixtures/cjs/foo.js')
  t.strictEqual(foo, foo2)
})

test('import relative', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/cjs'
  })
  const foo = await domture.import('./index')
  t.strictEqual(typeof foo, 'function')
})


test('work with requiring pakcage with missing main', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/fix-main'
  })
  const m = await domture.import('./index')
  t.strictEqual(m.name, 'makeError')
})

test('preload script', async () => {
  const domture = await createDomture({
    preloadScripts: [
      require.resolve('global-store/dist/global-store.es5.js')
    ]
  })

  t.notStrictEqual(domture.window.GlobalStore, undefined)
})

test('preload color-map script', async () => {
  const domture = await createDomture({
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
  const harness = await createDomture()
  await harness.loadScript('./node_modules/global-store/dist/global-store.es5.js')

  t.notStrictEqual(harness.window.GlobalStore, undefined)
})

test('import color-map script file should fill global namespace', async () => {
  const harness = await createDomture()
  await harness.loadScript(require.resolve('color-map/dist/color-map.es5.js'))

  t.notStrictEqual(harness.window.ColorMap, undefined)
})

test('preloadScripts should fill global namespace', async () => {
  const harness = await createDomture(
    {
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
    rootDir: './fixtures/global-deps'
  })
  await domture.loadScript('./foo')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScript() with relative path with extension`, async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global-deps'
  })
  await domture.loadScript('./foo.js')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScript() with absolute path`, async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global-deps'
  })

  await domture.loadScript(require.resolve('color-map/dist/color-map.es5.js'))

  t.notStrictEqual(domture.window.ColorMap, undefined)
})

test(`loadScript() with invalid path`, async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global-deps'
  })

  const err = await a.throws<any>(domture.loadScript('./a.js'))
  t.strictEqual(err.code, 'ENOENT')
})

test(`loadScriptSync() with relative path`, async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global-deps'
  })
  domture.loadScriptSync('./foo')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScriptSync() with relative path with extension`, async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global-deps'
  })
  domture.loadScriptSync('./foo.js')

  t.strictEqual(domture.window.foo.a, 1)
})

test(`loadScriptSync() with absolute path`, async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global-deps'
  })

  domture.loadScriptSync(require.resolve('color-map/dist/color-map.es5.js'))

  t.notStrictEqual(domture.window.ColorMap, undefined)
})

test(`loadScriptSync() with invalid path`, async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global-deps'
  })

  const err = a.throws<any>(() => domture.loadScriptSync('./a.js'))
  t.strictEqual(err.code, 'ENOENT')
})

test('support subfolder/index reference', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/with-subfolder'
  })

  const foo = await domture.import('./index')
  expect(foo()).toEqual({ value: 'foo' })
})

test('importing global file should try to get the value using namespaces when it exports nothing', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global'
  })

  let foo = await domture.import('./foo')
  expect(foo).toEqual({ a: 1 })

  let foo2 = await domture.import('./foo.js')
  expect(foo2).toEqual({ a: 1 })
})

test('importing nested global file should try to get the value using namespaces when it exports nothing', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/global'
  })

  let boo = await domture.import('./comp/boo')
  expect(boo).toEqual({ a: 2 })

  let boo2 = await domture.import('./comp/boo.js')
  expect(boo2).toEqual({ a: 2 })
})

test('config webpack devtool, entry, output will throw', async () => {
  await a.throws(createDomture({
    webpackConfig: {
      devtool: 'source-map'
    }
  }))
  await a.throws(createDomture({
    webpackConfig: {
      entry: './src/index'
    }
  }))
  await a.throws(createDomture({
    webpackConfig: {
      output: {}
    }
  }))
})

test('config webpack directly', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/cjs',
    webpackConfig: {
      module: {
        rules: [{
          test: /\.js$/,
          use: {
            loader: 'istanbul-instrumenter-loader'
          }
        }]
      }
    }
  })

  const foo = await domture.import('./index')
  t.strictEqual(foo(), 'foo')
})

test('config with html', async () => {
  const domture = await createDomture({ html: '<p>abc</p>' })
  t.strictEqual(domture.window.document.getElementsByTagName('p').length, 1)
})
