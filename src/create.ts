import * as extend from 'deep-extend'
import * as fileUrl from 'file-url'
import { env, createVirtualConsole } from 'jsdom'

import { defaultConfig, unpartial } from './config'
import { TestHarness, Config } from './interfaces'
import { TestHarnessImpl } from './TestHarnessImpl'
import { toSystemJSConfig } from './systemjsConfig'

export function createTypeScript(srcRoot: string = '.') {
  const config = { ...defaultConfig }
  config.srcRoot = srcRoot
  return create(config)
}

export function create(partialConfig?: Partial<Config>): Promise<TestHarness> {
  const config = unpartial(partialConfig)
  const sysConfig = toSystemJSConfig(config)
  const jsdomConfig = {}

  // Add `console.debug` to NodeJS environment.
  // so that debug message can be written
  console.debug = console.debug || console.log

  return setupJsDom(jsdomConfig)
    .then((win) => {
      const systemjs = win.SystemJS
      systemjs.config(sysConfig)

      return new TestHarnessImpl(win)
    })
}

function setupJsDom(jsdomConfig) {
  return new Promise<any>((resolve, reject) => {
    const virtualConsole = createVirtualConsole().sendTo(console)
    const config = extend(
      {
        html: '<br>',
        url: fileUrl(process.cwd()) + '/',
        virtualConsole,
        scripts: []
      },
      jsdomConfig,
      {
        done(err, win) {
          if (err)
            reject(err)
          else
            resolve(win)
        }
      })

    // `deep-extend` can't merge array, so need to push it here instead of declaring above.
    config.scripts.push(require.resolve('systemjs/dist/system.js'))
    env(config)
  })
}
