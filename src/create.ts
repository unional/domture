import * as extend from 'deep-extend'
import * as fileUrl from 'file-url'
import { env, createVirtualConsole } from 'jsdom'

import { unpartial } from './config'
import { Domture, Config } from './interfaces'
import { DomtureImpl } from './DomtureImpl'
import { toSystemJSConfig } from './systemjsConfig'

export function create(partialConfig?: Partial<Config>): Promise<Domture> {
  const config = unpartial(partialConfig)
  const sysConfig = toSystemJSConfig(config)

  // Add `console.debug` to NodeJS environment.
  // so that debug message can be written
  console.debug = console.debug || console.log

  return setupJsDom(config)
    .then((win) => {
      const systemjs = win.SystemJS
      systemjs.config(sysConfig)

      return new DomtureImpl(win)
    })
}

function setupJsDom(config: Config) {
  const { jsdomConfig = {} } = config
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
              resolve(win)
            }
            catch (e) {
              reject(e)
            }
          }
          else {
            if (err)
              reject(err)
            else
              resolve(win)
          }
        }
      })

    // `deep-extend` can't merge array, so need to push it here instead of declaring above.
    config.scripts.push(require.resolve('systemjs/dist/system.js'))
    env(config)
  })
}
