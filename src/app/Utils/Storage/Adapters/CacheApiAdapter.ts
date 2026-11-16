import type { StorageAdapterInterface } from './StorageAdapterInterface'

export class CacheApiAdapter implements StorageAdapterInterface {
  private readonly keyPrefix: string = 'https://hor.local/'
  private readonly cacheName: string

  constructor (cacheName: string) {
    this.cacheName = cacheName
  }

  public async set (key: string, value: unknown): Promise<void> {
    const cache: Cache = await this.getCache()
    await cache.put(this.key(key), new Response(JSON.stringify(value)))
  }

  public async get (key: string): Promise<unknown> {
    const cache: Cache = await this.getCache()
    const response: Response | undefined = await cache.match(this.key(key))

    if (!response) return

    return await response.json()
  }

  public async remove (key: string): Promise<void> {
    const cache: Cache = await this.getCache()
    await cache.delete(this.key(key))
  }

  public async keys (): Promise<string[]> {
    const cache: Cache = await this.getCache()
    const requests: readonly Request[] = await cache.keys()

    return requests.map((request: Request): string => decodeURIComponent(request.url.slice(this.keyPrefix.length)))
  }

  private getCache (): Promise<Cache> {
    return caches.open(this.cacheName)
  }

  private key (key: string): string {
    return `${this.keyPrefix}${encodeURIComponent(key)}`
  }
}
