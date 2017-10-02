type SystemJSConfig = SystemJSLoader.Config

export { SystemJSConfig }
export interface DomtureConfig {
  packageManager: 'npm', // | 'jspm', no support for jspm yet.
  /**
   * Specifies the root directory of input files.
   */
  rootDir: string,
  transpiler: 'none' | 'typescript',
  preloadScripts?: string[],
  systemjsConfig?: SystemJSConfig
}

export const defaultConfig: DomtureConfig = {
  packageManager: 'npm',
  rootDir: '.',
  transpiler: 'none'
}
