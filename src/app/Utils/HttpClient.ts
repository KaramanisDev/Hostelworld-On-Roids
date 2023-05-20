import type { KyResponse, NormalizedOptions, Options } from 'ky'
import { default as KyClient } from 'ky'
import { CacheStorage } from './CacheStorage'
import { hash } from './Utils'

export class HttpClient {
  private static readonly cacheTimeInMs: number = 24 * 60 * 60 * 1000
  private static readonly storage: CacheStorage<string> = new CacheStorage('http')

  public static async getJson (url: string): Promise<Object> {
    const response: KyResponse = await KyClient.get(url, this.options())

    return response.json()
  }

  private static options (): Options {
    return {
      hooks: {
        beforeRequest: [
          async (request: Request): Promise<Request | Response> => this.beforeRequestHook(request)
        ],
        afterResponse: [
          (request: Request, _: NormalizedOptions, response: Response): Promise<void> =>
            this.afterResponseHook(request, response)
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

  private static async afterResponseHook (request: Request, response: Response): Promise<void> {
    const cacheKey: string = this.cacheKey(request)

    const isInCacheAndNotExpired: boolean = await this.storage.hasNotExpired(cacheKey)
    if (isInCacheAndNotExpired) return

    const content: string = await response.text()
    await this.storage.put(cacheKey, content, this.cacheTimeInMs)
  }

  private static cacheKey (request: Request): string {
    return hash(`${request.url}_${request.method}`)
  }
}
