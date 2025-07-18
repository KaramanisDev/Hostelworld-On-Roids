import type { StorageAdapterInterface } from './Adapters/StorageAdapterInterface'
import type { StorageInterface } from 'Utils/Storage/StorageInterface'

type Item<T> = {
  payload: T
  expiresAt: number,
}

export abstract class AbstractStorage<T> implements StorageInterface<T> {
  private readonly name: string
  protected readonly abstract store: StorageAdapterInterface
  private readonly defaultExpiresAfterInMs: number = 15 * 60 * 1000 // 15 min

  constructor (name: string) {
    this.name = name
  }

  public async put (key: string, payload: T, expiresAfterInMs?: number): Promise<void> {
    const item: Item<T> = {
      payload,
      expiresAt: Date.now() + (expiresAfterInMs || this.defaultExpiresAfterInMs)
    }

    await this.store.set(key, item)
  }

  public async get (key: string): Promise<T | undefined> {
    const item = await this.store.get(key) as Item<T> | undefined

    if (!item) return

    const { payload } = item

    const hasNotExpired: boolean = await this.hasNotExpired(key)
    if (hasNotExpired) return payload

    await this.store.remove(key)
  }

  public async hasNotExpired (key: string): Promise<boolean> {
    const item = await this.store.get(key) as Item<T> | undefined

    if (!item) return false

    const { expiresAt } = item
    return Date.now() < expiresAt
  }
}
