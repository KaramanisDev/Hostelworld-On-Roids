import { default as Browser } from 'webextension-polyfill'

export class ExtensionRuntime {
  public static assetUrl (filename: string): string {
    return Browser.runtime.getURL(filename)
  }
}
