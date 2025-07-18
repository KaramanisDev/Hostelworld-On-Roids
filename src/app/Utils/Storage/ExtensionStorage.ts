import { AbstractStorage } from './AbstractStorage'
import { ExtensionLocalStorageAdapter } from './Adapters/ExtensionLocalStorageAdapter'
import type { StorageAdapterInterface } from './Adapters/StorageAdapterInterface'

export class ExtensionStorage<T = unknown> extends AbstractStorage<T> {
  protected readonly store: StorageAdapterInterface

  constructor (name: string) {
    super(name)

    this.store = new ExtensionLocalStorageAdapter(name)
  }
}
