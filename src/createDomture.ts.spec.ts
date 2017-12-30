import { test } from 'ava'
import { createDomture } from './index'


test('import relative with default rootDir (".")', async t => {
  const domture = await createDomture({ transpiler: 'typescript' })

  const config = await domture.import('./src/log')
  t.truthy(config)
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

test('import global script', async t => {
  const domture = await createDomture({ transpiler: 'typescript' })
  await domture.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = domture.window.MyCompany.component.TextBox
  t.deepEqual(textBox, { a: 1 })
})

test('import global script', async t => {
  const domture = await createDomture({ transpiler: 'typescript' })
  await domture.import('./fixtures/ts-global/MyCompany/component/TextBox')
  const textBox = domture.window.MyCompany.component.TextBox
  t.deepEqual(textBox, { a: 1 })
})

test(`import global script with type`, async t => {
  const domture = await createDomture({ transpiler: 'typescript' })

  await domture.import('./fixtures/ts-global/MyCompany/component/foo')
  const foo = domture.window.MyCompany.component.foo

  t.deepEqual(foo, 'foo')
})

test('load ts and js', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo.ts')
  t.deepEqual(foo.foo(), { value: 'foo' })

  const boo = await domture.import('./boo.js')
  t.is(boo.boo(), 'boo')
})

test('preload scripts with js extension', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/ts',
    transpiler: 'typescript',
    preloadScripts: [
      require.resolve('color-map/dist/color-map.es5.js')
    ]
  })
  t.not(domture.window.ColorMap, undefined)
})

test('preload scripts with js extension and explicitExtension true', async t => {
  const domture = await createDomture({
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
    rootDir: './fixtures/ts',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo')
  t.deepEqual(foo.foo(), { value: 'foo' })

  const boo = await domture.import('./boo')
  t.is(boo.boo(), 'boo')
})

test('support loading multiple extensions: ts and tsx', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/tsx',
    transpiler: 'typescript'
  })
  const foo = await domture.import('./foo')
  t.deepEqual(foo.foo(), { value: 'foo' })
  const doo = await domture.import('./doo')
  t.is(typeof doo.render, 'function')
})

test('support subfolder/index reference', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/ts-with-subfolder',
    transpiler: 'typescript'
  })

  const foo = await domture.import('./index')
  t.deepEqual(foo.foo(), { value: 'foo' })
})

test('project', async t => {
  const domture = await createDomture({
    rootDir: './fixtures/ts-project/src',
    transpiler: 'typescript'
  })
  const p = await domture.import('./index')
  t.deepEqual(p.foo(), { value: 'foo' })
})
