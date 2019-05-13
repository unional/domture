import t from 'assert'
import { createDomture } from './index'


test('import relative with default rootDir (".")', async () => {
  const domture = await createDomture({ transpiler: 'typescript' })

  const config = await domture.import('./src/log')
  t.ok(config)
})

test('load ts', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })
  const m = await domture.import('./index')
  t.strictEqual(typeof m, 'object')

  const getLogger = await domture.import('./getLogger')
  t.strictEqual(getLogger.getLogger.name, 'getLogger')
})

test('with rootDir should still load packages', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })

  const globalStore = await domture.import('global-store')
  t.strictEqual(typeof globalStore, 'object')
  t.strictEqual(globalStore.default.name, 'createStore')
})

test('import global script', async () => {
  const domture = await createDomture({ transpiler: 'typescript' })
  await domture.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = domture.window.MyCompany.component.TextBox
  expect(textBox).toEqual({ a: 1 })
})

test('import global script', async () => {
  const domture = await createDomture({ transpiler: 'typescript' })
  await domture.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = domture.window.MyCompany.component.TextBox
  expect(textBox).toEqual({ a: 1 })
})

test(`import global script with type`, async () => {
  const domture = await createDomture({ transpiler: 'typescript' })

  await domture.import('./fixtures/ts-global/MyCompany/component/foo')
  const foo = domture.window.MyCompany.component.foo

  t.deepStrictEqual(foo, 'foo')
})

test('load ts and js', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo.ts')
  expect(foo.foo()).toEqual({ value: 'foo' })

  const boo = await domture.import('./boo.js')
  t.strictEqual(boo.boo(), 'boo')
})

test('preload scripts with js extension', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript',
    preloadScripts: [
      require.resolve('color-map/dist/color-map.es5.js')
    ]
  })
  t.notStrictEqual(domture.window.ColorMap, undefined)
})

test('preload scripts with js extension and explicitExtension true', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript',
    preloadScripts: [
      require.resolve('color-map/dist/color-map.es5.js')
    ]
  })
  t.notStrictEqual(domture.window.ColorMap, undefined)
})

test('support loading multiple extensions: ts and js', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo')
  expect(foo.foo()).toEqual({ value: 'foo' })

  const boo = await domture.import('./boo')
  t.strictEqual(boo.boo(), 'boo')
})

test('support loading multiple extensions: ts and tsx', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/tsx',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo')
  expect(foo.foo()).toEqual({ value: 'foo' })
  const doo = await domture.import('./doo')
  t.strictEqual(typeof doo.render, 'function')
})

test('support subfolder/index reference', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts-with-subfolder',
    transpiler: 'typescript'
  })

  const foo = await domture.import('./index')
  expect(foo.foo()).toEqual({ value: 'foo' })
})

test('project', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts-project/src',
    transpiler: 'typescript'
  })
  const p = await domture.import('./index')
  expect(p.foo()).toEqual({ value: 'foo' })
})

test('config webpack directly', async () => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript',
    webpackConfig: {
      module: {
        rules: [{
          test: /\.ts$/,
          use: {
            loader: 'istanbul-instrumenter-loader'
          }
        }]
      }
    }
  })

  const foo = await domture.import('./foo')
  expect(foo.foo()).toEqual({ value: 'foo' })
})
