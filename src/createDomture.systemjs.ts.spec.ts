import t from 'assert'
import { createDomture } from './index'

test('import relative with default rootDir (".")', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    transpiler: 'typescript'
  })

  const config = await domture.import('./src/log')
  t.ok(config)
})

test('load ts', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
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
    loader: 'systemjs',
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })

  const globalStore = await domture.import('global-store')
  t.strictEqual(typeof globalStore, 'object')
  t.strictEqual(globalStore.default.name, 'createStore')
})

test('import global script', async () => {
  const harness = await createDomture({
    loader: 'systemjs',
    transpiler: 'typescript'
  })
  await harness.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = harness.window.MyCompany.component.TextBox
  expect(textBox).toEqual({ a: 1 })
})

test('import global script', async () => {
  const harness = await createDomture({
    loader: 'systemjs',
    transpiler: 'typescript'
  })
  await harness.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = harness.window.MyCompany.component.TextBox
  expect(textBox).toEqual({ a: 1 })
})

test(`import global script with type`, async () => {
  const harness = await createDomture({
    loader: 'systemjs',
    transpiler: 'typescript'
  })

  await harness.import('./fixtures/ts-global/MyCompany/component/foo')
  const foo = harness.window.MyCompany.component.foo

  t.strictEqual(foo, 'foo')
})

test('preload scripts with js extension', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
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
    loader: 'systemjs',
    rootDir: './fixtures/ts',
    transpiler: 'typescript',
    moduleFileExtensions: ['ts', 'js']
  })
  const foo = await domture.import('./foo')
  expect(foo.foo()).toEqual({ value: 'foo' })

  const boo = await domture.import('./boo')
  t.strictEqual(boo.boo(), 'boo')
})

test('support loading multiple extensions: ts and tsx', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/tsx',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo')
  expect(foo.foo()).toEqual({ value: 'foo' })
  const doo = await domture.import('./doo')
  t.strictEqual(typeof doo.render, 'function')
})

test.skip('support subfolder/index reference', async () => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/ts-with-subfolder',
    transpiler: 'typescript'
  })

  const foo = await domture.import('./index')
  expect(foo.foo()).toEqual({ value: 'foo' })
})
