import { ConstructorOptions } from 'jsdom'
type SystemJSConfig = SystemJSLoader.Config

export { SystemJSConfig }

export type Transpiler = 'none' | 'typescript'

export interface DomtureConfigBase {
  packageManager: 'npm', // | 'jspm', no support for jspm yet.
  /**
   * Specifies the root directory of input files.
   * This should be a relative path like `./src`
   */
  rootDir: string,
  transpiler: Transpiler,
  preloadScripts?: string[],
  jsdomConstructorOptions?: ConstructorOptions
}

export interface WebpackDomtureConfig extends DomtureConfigBase {
  loader: 'webpack'
}

export interface SystemJSDomtureConfig extends DomtureConfigBase {
  loader: 'systemjs',
  /**
   * If specified, will attempt to locate files with these extensions.
   */
  moduleFileExtensions?: string[],
  systemjsConfig?: SystemJSConfig
}

export type DomtureConfig = WebpackDomtureConfig | SystemJSDomtureConfig

export const defaultConfig: DomtureConfig = {
  loader: 'webpack',
  packageManager: 'npm',
  rootDir: '.',
  transpiler: 'none'
}
