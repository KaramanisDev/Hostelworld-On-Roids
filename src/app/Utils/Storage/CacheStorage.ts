import { AbstractStorage } from './AbstractStorage'
import { WindowCacheApiAdapter } from './Adapters/WindowCacheApiAdapter'
import type { StorageAdapterInterface } from './Adapters/StorageAdapterInterface'

export class CacheStorage<T = unknown> extends AbstractStorage<T> {
  protected readonly store: StorageAdapterInterface

  constructor (name: string) {
    super(name)

    this.store = new WindowCacheApiAdapter(name)
  }
}
