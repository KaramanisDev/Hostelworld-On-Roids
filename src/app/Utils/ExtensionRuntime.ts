import { default as Extension, Runtime } from 'webextension-polyfill'
import { promiseFallback } from 'Utils/Utils'

export type Message<TPayload = unknown> = {
  event: string,
  payload: TPayload
}

type MessageListener = Runtime.OnMessageListener
type MessageSender = Runtime.MessageSender
type OnMessageHandler<TPayload> = (event: string, payload: TPayload) => void

export class ExtensionRuntime {
  static contentScriptTabs: Set<number> = new Set()

  public static assetUrl (filename: string): string {
    return Extension.runtime.getURL(filename)
  }

  public static sendMessage (event: string, payload: unknown): void {
    if (!this.isWithinServiceWorker()) {
      void Extension.runtime.sendMessage({ event, payload })

      return
    }

    for (const tabId of this.contentScriptTabs) {
      void promiseFallback(
        Extension.tabs.sendMessage(tabId, { event, payload })
      )
    }
  }

  public static onMessage<TPayload = unknown> (callback: OnMessageHandler<TPayload>) {
    Extension.runtime.onMessage.addListener(
      this.listener(callback, false)
    )
  }

  public static onMessageOnce<TPayload = unknown> (callback: OnMessageHandler<TPayload>) {
    Extension.runtime.onMessage.addListener(
      this.listener(callback, true)
    )
  }

  private static listener<TPayload = unknown> (
    callback: OnMessageHandler<TPayload>,
    removeOnExecute: boolean = false
  ): MessageListener {
    const listener: MessageListener = (request: unknown, sender: MessageSender): void => {
      if (sender.tab?.id) {
        this.contentScriptTabs.add(sender.tab.id)
      }

      const { event, payload } = request as Message<TPayload>
      void callback(event, payload)

      if (!removeOnExecute) return
      Extension.runtime.onMessage.removeListener(listener)
    }

    return listener
  }

  private static isWithinServiceWorker (): boolean {
    return typeof window === 'undefined' && typeof self !== 'undefined'
  }
}
