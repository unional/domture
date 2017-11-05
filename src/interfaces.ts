import { JSDOM, DOMWindow, CookieJar, VirtualConsole } from 'jsdom'

// re-export
export { CookieJar, DOMWindow, VirtualConsole }

type SystemJS = SystemJSLoader.System
export { SystemJS }

export interface Domture extends JSDOM {
  /**
   * Window and any global namespaces.
   */
  window: DOMWindow & { [index: string]: any }
  /**
   * SystemJS instance.
   */
  systemjs: SystemJSLoader.System
  /**
   * Import module or file.
   * @param identifier Module name or case-insensitive namespace path (`MyPackage.some.thing`)
   * or relative path (`./js/pan/base/grid`)
   */
  import(identifier: string): Promise<any>
  /**
   * Get coverage result when `collectCoverage` is true.
   */
  // getCoverage(): any
}
