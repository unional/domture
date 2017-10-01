import { JSDOM, DOMWindow } from 'jsdom'

require('systemjs')

type SystemjsConfig = SystemJSLoader.Config
export { SystemjsConfig }

export interface Domture extends JSDOM {
  /**
   * Window and any global namespaces.
   */
  window: DOMWindow & { [index: string]: any }
  /**
   * Import module or file.
   * @param identifier Module name or case-insensitive namespace path (`MyPackage.some.thing`)
   * or relative path (`./js/pan/base/grid`)
   */
  import(identifier: string): Promise<any>
}

export interface Config {
  packageManager: 'npm', // | 'jspm', no support for jspm yet.
  /**
   * Folder for your source code.
   * It should be relative: `./some-folder`
   */
  srcRoot: string,
  transpiler: 'none' | 'typescript',
  preloadScripts?: string[],
  systemjsConfig?: SystemjsConfig
}
