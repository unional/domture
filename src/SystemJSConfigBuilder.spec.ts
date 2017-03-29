import test from 'ava'

import { SystemJSConfigBuilder, create } from './index'

test('should build basic config that works with npm', async t => {
  const builder = new SystemJSConfigBuilder()
  const config = builder.build()
  const harness = await create(config)
  const globalStore = await harness.import('npm:global-store')
  t.is(typeof globalStore, 'object')
})
