import { default as Extension, Runtime } from 'webextension-polyfill'
import { promiseFallback } from 'Utils/Utils'

export type Message<TPayload = unknown> = {
  event: string,
  payload: TPayload
}

type MessageSender = Runtime.MessageSender
type OnMessageHandler<TPayload> = (event: string, payload: TPayload) => void

export class ExtensionRuntime {
  static contentScriptTabs: Set<number> = new Set()

  public static assetUrl (filename: string): string {
    return Extension.runtime.getURL(filename)
  }

  public static isWithinServiceWorker (): boolean {
    return typeof window === 'undefined' && typeof self !== 'undefined'
  }

  public static sendMessage (event: string, payload: unknown): void {
    if (!this.isWithinServiceWorker()) {
      void promiseFallback(Extension.runtime.sendMessage({ event, payload }))

      return
    }

    for (const tabId of this.contentScriptTabs) {
      void promiseFallback(
        Extension.tabs.sendMessage(tabId, { event, payload })
      )
    }
  }

  public static onMessage<TPayload = unknown> (callback: OnMessageHandler<TPayload>): void {
    Extension.runtime.onMessage.addListener(
      (request: unknown, sender: MessageSender): void => {
        if (sender.tab?.id) {
          this.contentScriptTabs.add(sender.tab.id)
        }

        const { event, payload } = request as Message<TPayload>
        callback(event, payload)
      }
    )
  }
}
