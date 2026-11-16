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
  private readonly nextPurgeAtKey: string = 'storage:next-purge-at'
  private readonly purgeIntervalInMs: number = 24 * 60 * 60 * 1000

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

    if (!this.isExpired(item)) return item.payload

    await this.store.remove(key)
  }

  public async purgeExpired (): Promise<void> {
    const nextPurgeAt = await this.store.get(this.nextPurgeAtKey) as number | undefined
    if (nextPurgeAt && Date.now() < nextPurgeAt) return

    for (const key of await this.store.keys()) {
      if (key === this.nextPurgeAtKey) continue

      const item = await this.store.get(key) as Item<T> | undefined
      if (item && !this.isExpired(item)) continue

      await this.store.remove(key)
    }

    await this.store.set(this.nextPurgeAtKey, Date.now() + this.purgeIntervalInMs)
  }

  private isExpired (item: Item<T>): boolean {
    return Date.now() >= item.expiresAt
  }
}
