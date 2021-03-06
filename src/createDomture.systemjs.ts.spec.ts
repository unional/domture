import test from 'ava'
import { createDomture } from './index'


test('import relative with default rootDir (".")', async t => {
  const domture = await createDomture({
    loader: 'systemjs',
    transpiler: 'typescript'
  })

  const config = await domture.import('./src/log')
  t.truthy(config)
})

test('load ts', async t => {
  const domture = await createDomture({
    loader: 'systemjs',
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
    loader: 'systemjs',
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })

  const globalStore = await domture.import('global-store')
  t.is(typeof globalStore, 'object')
  t.is(globalStore.default.name, 'createStore')
})

test('import global script', async t => {
  const harness = await createDomture({
    loader: 'systemjs',
    transpiler: 'typescript'
  })
  await harness.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = harness.window.MyCompany.component.TextBox
  t.deepEqual(textBox, { a: 1 })
})

test(`import global script with type`, async t => {
  const harness = await createDomture({
    loader: 'systemjs',
    transpiler: 'typescript'
  })

  await harness.import('./fixtures/ts-global/MyCompany/component/foo')
  const foo = harness.window.MyCompany.component.foo

  t.deepEqual(foo, 'foo')
})

test('preload scripts with js extension', async t => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/ts',
    transpiler: 'typescript',
    preloadScripts: [
      require.resolve('color-map/dist/color-map.es5.js')
    ]
  })
  t.not(domture.window.ColorMap, undefined)
})

test('support loading multiple extensions: ts and js', async t => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/ts',
    transpiler: 'typescript',
    moduleFileExtensions: ['ts', 'js']
  })
  const foo = await domture.import('./foo')
  t.deepEqual(foo.foo(), { value: 'foo' })

  const boo = await domture.import('./boo')
  t.is(boo.boo(), 'boo')
})

test('support loading multiple extensions: ts and tsx', async t => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/tsx',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo')
  t.deepEqual(foo.foo(), { value: 'foo' })
  const doo = await domture.import('./doo')
  t.is(typeof doo.render, 'function')
})

test.skip('support subfolder/index reference', async t => {
  const domture = await createDomture({
    loader: 'systemjs',
    rootDir: './fixtures/ts-with-subfolder',
    transpiler: 'typescript'
  })

  const foo = await domture.import('./index')
  t.deepEqual(foo.foo(), { value: 'foo' })
})
