import type { StorageAdapterInterface } from './StorageAdapterInterface'

export class WindowCacheApiAdapter implements StorageAdapterInterface {
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

    if (!response) return undefined

    return await response.json()
  }

  public async remove (key: string): Promise<void> {
    const cache: Cache = await this.getCache()
    await cache.delete(this.key(key))
  }

  private getCache (): Promise<Cache> {
    return window.caches.open(this.cacheName)
  }

  private key (key: string): string {
    return `https://hor.local/${key}`
  }
}
