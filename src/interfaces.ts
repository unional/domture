require('systemjs')
import { Config as JsdomConfig } from 'jsdom'

type SystemjsConfig = SystemJSLoader.Config
export { JsdomConfig }
export { SystemjsConfig }

export interface Domture {
  /**
   * Window and any global namespaces.
   */
  window: Window & { [index: string]: any }
  /**
   * Import module or file.
   * @param identifier Module name or case-insensitive namespace path (`pan/base/grid`)
   * or relative path (`./js/pan/base/grid`)
   */
  import(identifier: string): Promise<any>
}

export interface Config {
  packageManager: 'npm' | 'jspm',
  /**
   * Folder for your source code.
   * It should be relative: `./some-folder`
   */
  srcRoot: string,
  writtenIn: 'es5' | 'ts',
  jsdomConfig?: JsdomConfig,
  systemjsConfig?: SystemjsConfig
}
