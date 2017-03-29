import test from 'ava'

import { create, createTypeScript } from './index'

test('import cjs', async t => {
  const harness = await create()
  const extend = await harness.import('npm:deep-extend')
  t.is(typeof extend, 'function')
})

test('import es6', async t => {
  const harness = await create()
  const globalStore = await harness.import('npm:global-store')
  t.is(typeof globalStore, 'object')
})

test('import relative', async t => {
  const harness = await create()
  const impl = await harness.import('./dist/es5/TestHarnessImpl.js')
  t.is(typeof impl, 'object')
})

test.only('load ts', async t => {
  const harness = await createTypeScript()
  const impl = await harness.import('./src/TestHarnessImpl.ts')
  t.is(typeof impl, 'object')
})
