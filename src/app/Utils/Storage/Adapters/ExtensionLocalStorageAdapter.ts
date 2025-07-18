import { default as Extension } from 'webextension-polyfill'
import type { StorageAdapterInterface } from './StorageAdapterInterface'

export class ExtensionLocalStorageAdapter implements StorageAdapterInterface {
  private readonly namespace: string

  constructor (namespace: string) {
    this.namespace = namespace
  }

  public async set (key: string, value: unknown): Promise<void> {
    await Extension.storage.local.set({ [this.namespaced(key)]: value })
  }

  public async get (key: string): Promise<unknown> {
    const namespacedKey: string = this.namespaced(key)
    const result: Record<string, unknown> = await Extension.storage.local.get(namespacedKey)

    return result[namespacedKey]
  }

  public async remove (key: string): Promise<void> {
    await Extension.storage.local.remove(this.namespaced(key))
  }

  private namespaced (key: string): string {
    return `${this.namespace}:${key}`
  }
}
