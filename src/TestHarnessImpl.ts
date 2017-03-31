export class TestHarnessImpl {
  private systemjs: typeof SystemJS
  constructor(public window: Window) {
    this.systemjs = (window as any).SystemJS
  }

  /**
   * Import module or file.
   * @param identifier Can be either:
   * Module name: `color-map`,
   * Relative path (from root): `./src/index.js`
   */
  import(identifier: string) {
    const id = this.isRelative(identifier) ? identifier.replace('.', 'app') : identifier

    return this.systemjs.import(id)
  }

  private isRelative(identifier: string) {
    return identifier.indexOf('.') === 0
  }
}
