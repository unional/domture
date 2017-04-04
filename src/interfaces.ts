require('systemjs')

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
   * Packages config as in `systemjs`.
   */
  packages: { [packageName: string]: SystemJSLoader.PackageConfig },
  /**
   * Folder for your source code.
   * It should be relative: `./some-folder`
   */
  srcRoot: string,
  map: { [index: string]: string },
  writtenIn: 'es5' | 'ts'
}
