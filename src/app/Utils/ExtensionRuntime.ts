import { default as Extension, Runtime } from 'webextension-polyfill'
import { promiseFallback } from 'Utils/Utils'

export type Message<TPayload = unknown> = {
  event: string,
  payload: TPayload
}

type MessageSender = Runtime.MessageSender
type OnMessageHandler<TPayload> = (event: string, payload: TPayload, tabId?: number) => void

export class ExtensionRuntime {
  public static assetUrl (filename: string): string {
    return Extension.runtime.getURL(filename)
  }

  public static manifestVersion (): string {
    return Extension.runtime.getManifest().version
  }

  public static manifestHomepage (): string {
    return Extension.runtime.getManifest().homepage_url as string
  }

  public static manifestName (): string {
    return Extension.runtime.getManifest().name
  }

  public static platformInfo (): Promise<Runtime.PlatformInfo> {
    return Extension.runtime.getPlatformInfo()
  }

  public static sendMessage (event: string, payload: unknown): void {
    void promiseFallback(Extension.runtime.sendMessage({ event, payload }))
  }

  public static sendMessageToTab (tabId: number, event: string, payload: unknown): void {
    void promiseFallback(Extension.tabs.sendMessage(tabId, { event, payload }))
  }

  public static onMessage<TPayload = unknown> (callback: OnMessageHandler<TPayload>): void {
    Extension.runtime.onMessage.addListener(
      (request: unknown, sender: MessageSender): void => {
        const { event, payload } = request as Message<TPayload>
        callback(event, payload, sender.tab?.id)
      }
    )
  }
}
