import { EventBus } from './EventBus'
import { Session } from 'DTOs/Session'
import { XHRRequestInterceptor } from 'Utils/XHRRequestInterceptor'

type RequireContext = __WebpackModuleApi.RequireContext

export class AppInitializer {
  public static init (): void {
    this.initEventBusWithListeners()

    XHRRequestInterceptor.init()

    return EventBus.emit('app:inited')
  }

  private static initEventBusWithListeners (): void {
    EventBus.initWith({ session: new Session() })

    this.subscribeListeners()
  }

  private static subscribeListeners (): void {
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
