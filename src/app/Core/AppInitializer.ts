import { EventBus } from './EventBus'
import { XHRRequestInterceptor } from '../Utils/XHRRequestInterceptor'

type RequireContext = __WebpackModuleApi.RequireContext

export class AppInitializer {
  static init (): void {
    this.loadListeners()

    XHRRequestInterceptor.init()

    return EventBus.emit('app:inited')
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
