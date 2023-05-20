type Item<T> = {
  payload: T
  expiresAt: number,
}

export class CacheStorage<T> {
  private readonly name: string
  private readonly defaultExpiresAfterInMs: number = 15 * 60 * 1000

  constructor (name: string) {
    this.name = name
  }

  public async put (key: string, payload: T, expiresAfterInMs?: number): Promise<void> {
    const item: Item<T> = {
      payload,
      expiresAt: Date.now() + (expiresAfterInMs || this.defaultExpiresAfterInMs)
    }

    const store: Cache = await this.cacheStore()
    await store.put(key, new Response(JSON.stringify(item)))
  }

  public async get (key: string): Promise<T | undefined> {
    const store: Cache = await this.cacheStore()
    const response: Response | undefined = await store.match(key)
    if (!response) return

    const { payload } = await response.json()

    const hasNotExpired: boolean = await this.hasNotExpired(key)
    if (hasNotExpired) return payload

    await store.delete(key)
    return
  }

  public async hasNotExpired (key: string): Promise<boolean> {
    const store: Cache = await this.cacheStore()
    const response: Response | undefined = await store.match(key)

    if (!response) return false

    const { expiresAt } = await response.json()
    return Date.now() < expiresAt
  }

  private cacheStore (): Promise<Cache> {
    return window.caches.open(this.name)
  }
}
