type RequireContext = __WebpackModuleApi.RequireContext

export class AppInitializer {
  static init (): void {
    this.loadListeners()
  }

  static loadListeners (): void {
    const context: RequireContext = require.context(
      '../Listeners',
      true,
      /^(?!.*(?:Abstract|Interface)).*\.ts$/,
      'sync'
    )

    for (const listenerFile of context.keys()) {
      context(listenerFile)
    }
  }
}
