import test from 'ava'

import { create } from './index'

test('import cjs', async t => {
  const domture = await create()
  const extend = await domture.import('deep-extend')
  t.is(typeof extend, 'function')
})

test('import es6', async t => {
  const domture = await create()

  const globalStore = await domture.import('global-store')

  t.is(typeof globalStore, 'object')
})

test('import relative with default', async t => {
  const domture = await create({ writtenIn: 'ts' })

  const config = await domture.import('./config')

  t.truthy(config.defaultConfig)
})

test('import relative', async t => {
  const domture = await create({
    srcRoot: './fixtures/cjs'
  })
  const impl = await domture.import('./index')
  t.is(typeof impl, 'function')
})

test('load ts', async t => {
  const domture = await create({
    srcRoot: './fixtures/ts',
    writtenIn: 'ts'
  })
  const impl = await domture.import('./foo')
  t.is(typeof impl, 'object')
})

test('fix missing main', async t => {
  const domture = await create({
    srcRoot: './fixtures/fix-main',
    packages: {
      'make-error': {
        main: 'index'
      }
    }
  })
  const m = await domture.import('./index')
  t.is(m.name, 'makeError')
})
