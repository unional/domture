import test from 'ava'

import { create } from './index'

test('import cjs', async t => {
  const harness = await create()
  const extend = await harness.import('deep-extend')
  t.is(typeof extend, 'function')
})

test('import es6', async t => {
  const harness = await create()
  const globalStore = await harness.import('global-store')
  t.is(typeof globalStore, 'object')
})

test('import cjs', async t => {
  const harness = await create({
    srcRoot: './fixtures/cjs'
  })
  const impl = await harness.import('./index.js')
  t.is(typeof impl, 'function')
})

test('load ts', async t => {
  const harness = await create({
    srcRoot: './fixtures/ts',
    writtenIn: 'ts',
    packageMainsToFix: ['file-url']
  })
  const impl = await harness.import('./foo.ts')
  t.is(typeof impl, 'object')
})
