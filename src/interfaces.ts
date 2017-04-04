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
  /**
   * Callback function to be called when the domture is created.
   */
  onCreated?: (err, win) => void
  packageManager: 'npm' | 'jspm',
  /**
   * Packages config as in `systemjs`.
   */
  packages: { [packageName: string]: SystemJSLoader.PackageConfig },
  /**
   * Scripts to load when creating the domture.
   */
  scripts: string[]
  /**
   * Folder for your source code.
   * It should be relative: `./some-folder`
   */
  srcRoot: string,
  map: { [index: string]: string },
  writtenIn: 'es5' | 'ts'
}
