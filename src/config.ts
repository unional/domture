import { ConstructorOptions } from 'jsdom'

export type Transpiler = 'none' | 'typescript'

export interface DomtureConfig {
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

export const defaultConfig: DomtureConfig = {
  packageManager: 'npm',
  rootDir: '.',
  transpiler: 'none'
}
