import type { AfterResponseState, BeforeRequestState, KyResponse, Options } from 'ky'
import { default as KyClient, isHTTPError } from 'ky'
import { CacheStorage } from 'Utils/Storage/CacheStorage'
import { delay, hash, promiseFallback, randomNumber } from 'Utils/index'
import type { StorageInterface } from 'Utils/Storage/StorageInterface'

export type HttpClientOptions = {
  cacheInMinutes?: number
  networkJitterInMs?: number
  headers?: Record<string, string | undefined>,
}

export class HttpClient {
  private static readonly defaultCacheTimeInMinutes: number = 24 * 60
  private static readonly requestTimeoutInMs: number = 15_000
  private static readonly maxRetryAfterInMs: number = 10_000
  private static readonly cacheHitHeader: string = 'x-hor-cache'
  private static readonly storage: StorageInterface<string> = new CacheStorage('hor-http-client')

  public static async getJson<T = Record<string, unknown>> (url: string, options?: HttpClientOptions): Promise<T> {
    const response: KyResponse = await KyClient.get(url, this.options(options))

    return response.json()
  }

  public static isNotFound (error: unknown): boolean {
    return isHTTPError(error) && error.response.status === 404
  }

  private static options (options?: HttpClientOptions): Options {
    let kyOptions: Options = {
      headers: options?.headers,
      timeout: this.requestTimeoutInMs,
      retry: { maxRetryAfter: this.maxRetryAfterInMs }
    }

    if (options?.cacheInMinutes) {
      kyOptions = {
        ...kyOptions,
        hooks: {
          beforeRequest: [
            async ({ request }: BeforeRequestState): Promise<Request | Response> =>
              this.beforeRequestHook(request, options?.networkJitterInMs)
          ],
          afterResponse: [
            ({ request, response }: AfterResponseState): Promise<void> =>
              this.afterResponseHook(request, response, options?.cacheInMinutes)
          ]
        }
      }
    }

    return kyOptions
  }

  private static async beforeRequestHook (request: Request, networkJitterInMs?: number): Promise<Request | Response> {
    const cachedContent: string | undefined = await promiseFallback(
      this.storage.get(this.cacheKey(request))
    )
    if (cachedContent) return new Response(cachedContent, { headers: { [this.cacheHitHeader]: 'hit' } })

    if (networkJitterInMs) await delay(randomNumber(0, networkJitterInMs))

    return request
  }

  private static async afterResponseHook (
    request: Request,
    response: Response,
    cacheInMinutes?: number
  ): Promise<void> {
    const isCacheable: boolean = response.ok && !response.headers.has(this.cacheHitHeader)
    if (!isCacheable) return

    const content: string = await response.clone().text()
    const cacheTimeInMs: number = (cacheInMinutes ?? this.defaultCacheTimeInMinutes) * 60 * 1000

    return promiseFallback(this.storage.put(this.cacheKey(request), content, cacheTimeInMs))
  }

  private static cacheKey (request: Request): string {
    return hash(`${request.url}_${request.method}`)
  }
}
