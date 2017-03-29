import { env, createVirtualConsole, Config } from 'jsdom'
import * as SystemJS from 'systemjs'
import * as extend from 'deep-extend'
import * as fileUrl from 'file-url'

import { TestHarness } from './interfaces'
import { TestHarnessImpl } from './TestHarnessImpl'
import { SystemJSConfigBuilder } from './SystemJSConfigBuilder'

export function createTypeScript() {
  const builder = new SystemJSConfigBuilder()
  builder.useTypeScript()
  console.log(builder.build())
  return create(builder.build())
}

export function create(systemJSConfig: SystemJSLoader.Config = new SystemJSConfigBuilder().build(), jsdomConfig: Config = {}): Promise<TestHarness> {
  let window: Window
  let systemjs: typeof SystemJS

  // Add `console.debug` to NodeJS environment.
  // so that debug message can be written
  console.debug = console.debug || console.log
  return setupJsDom(jsdomConfig)
    .then((win) => {
      window = win
      systemjs = win.SystemJS
      systemjs.config(systemJSConfig)

      return new TestHarnessImpl(window)
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
          if (jsdomConfig.done) {
            try {
              jsdomConfig.done(err, win)
            }
            catch (e) {
              reject(e)
            }
          }

          if (err)
            reject(err)
          else
            resolve(win)
        }
      })

    // `deep-extend` can't merge array, so need to push it here instead of declaring above.
    config.scripts.push(require.resolve('systemjs'))
    env(config)
  })
}
