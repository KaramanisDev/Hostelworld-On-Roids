import type { KyResponse, NormalizedOptions, Options } from 'ky'
import { default as KyClient } from 'ky'
import { CacheStorage } from './CacheStorage'
import { hash } from './Utils'

export class HttpClient {
  private static readonly defaultCacheTimeInMinutes: number = 24 * 60
  private static readonly storage: CacheStorage<string> = new CacheStorage('http-client')

  public static async getJson<T = Record<string, unknown>> (url: string, cacheInMinutes?: number): Promise<T> {
    const response: KyResponse = await KyClient.get(url, this.options(cacheInMinutes))

    return response.json()
  }

  private static options (cacheInMinutes?: number): Options {
    if (!cacheInMinutes) return {}

    return {
      hooks: {
        beforeRequest: [
          async (request: Request): Promise<Request | Response> => this.beforeRequestHook(request)
        ],
        afterResponse: [
          (request: Request, _: NormalizedOptions, response: Response): Promise<void> =>
            this.afterResponseHook(request, response, cacheInMinutes)
        ]
      }
    }
  }

  private static async beforeRequestHook (request: Request): Promise<Request | Response> {
    const cachedContent: string | undefined = await this.storage.get(
      this.cacheKey(request)
    )
    if (!cachedContent) return request

    return new Response(cachedContent)
  }

  private static async afterResponseHook (request: Request, response: Response, cacheInMinutes?: number): Promise<void> {
    const cacheKey: string = this.cacheKey(request)

    const hasNotExpired: boolean = await this.storage.hasNotExpired(cacheKey)
    if (hasNotExpired) return

    const content: string = await response.text()
    const cacheTimeInMs: number = (cacheInMinutes ?? this.defaultCacheTimeInMinutes) * 60 * 1000

    return this.storage.put(cacheKey, content, cacheTimeInMs)
  }

  private static cacheKey (request: Request): string {
    return hash(`${request.url}_${request.method}`)
  }
}
