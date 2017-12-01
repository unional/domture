import { ConstructorOptions } from 'jsdom'
type SystemJSConfig = SystemJSLoader.Config

export { SystemJSConfig }

export type Transpiler = 'none' | 'typescript'

export interface DomtureConfig {
  packageManager: 'npm', // | 'jspm', no support for jspm yet.
  /**
   * Specifies the root directory of input files.
   * This should be a relative path like `./src`
   */
  rootDir: string,
  transpiler: Transpiler,
  /**
   * When true, require to specify extension explicitly.
   * This is useful when using `typescript` while also need to load javascript.
   * @deprecated this flag requires actual code to also use explicit extension in its `require` and `import`. Use `moduleFileExtensions` instead
   */
  explicitExtension?: boolean,
  /**
   * If specified, will attempt to locate files with these extensions.
   */
  moduleFileExtensions?: string[],
  preloadScripts?: string[],
  systemjsConfig?: SystemJSConfig,
  jsdomConstructorOptions?: ConstructorOptions
}

export const defaultConfig: DomtureConfig = {
  packageManager: 'npm',
  rootDir: '.',
  transpiler: 'none'
}
