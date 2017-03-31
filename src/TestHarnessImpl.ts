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
  async import(identifier: string) {
    if (this.isRelative(identifier)) {
      return this.resolveRelative(identifier)
    }

    const result = await this.systemjs.import(identifier)
    return result
  }

  private isRelative(identifier: string) {
    return identifier.indexOf('.') === 0
  }

  private resolveRelative(identifier: string) {
    const id = identifier.replace('.', 'app')
    return this.systemjs.import(id)
  }
}
