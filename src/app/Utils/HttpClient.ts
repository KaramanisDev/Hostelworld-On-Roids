import type { KyResponse, NormalizedOptions, Options } from 'ky'
import { default as KyClient } from 'ky'
import { CacheStorage } from './CacheStorage'
import { hash } from './Utils'

export type HttpClientOptions = {
  cacheInMinutes?: number
  headers?: Record<string, string | undefined>,
}

export class HttpClient {
  private static readonly defaultCacheTimeInMinutes: number = 24 * 60
  private static readonly storage: CacheStorage<string> = new CacheStorage('hor-http-client')

  public static async getJson<T = Record<string, unknown>> (url: string, options?: HttpClientOptions): Promise<T> {
    const response: KyResponse = await KyClient.get(url, this.options(options))

    return response.json()
  }

  private static options (options?: HttpClientOptions): Options {
    let kyOptions: Options = {
      headers: options?.headers
    }

    if (options?.cacheInMinutes) {
      kyOptions = {
        ...kyOptions,
        hooks: {
          beforeRequest: [
            async (request: Request): Promise<Request | Response> => this.beforeRequestHook(request)
          ],
          afterResponse: [
            (request: Request, _: NormalizedOptions, response: Response): Promise<void> =>
              this.afterResponseHook(request, response, options?.cacheInMinutes)
          ]
        }
      }
    }

    return kyOptions
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
