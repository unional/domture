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

    console.log('importing', id)
    return this.systemjs.import(id)
      .then(() => {
        console.log('then')
      }, () => {
        console.log('other')
      })
  }

  private isRelative(identifier: string) {
    return identifier.indexOf('.') === 0
  }
}
