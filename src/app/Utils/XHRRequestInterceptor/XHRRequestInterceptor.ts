import { InterceptedRequest } from './InterceptedRequest'
import { CustomXMLHttpRequest } from './CustomXMLHttpRequest'
import { hash } from '../Utils'

type UrlMatcher = RegExp | URL | string
type StatusMatcher = RegExp | number

type InterceptionPattern = {
  method: string
  url: UrlMatcher
  status: StatusMatcher
}

type Interceptors = {
  [key: string]: InterceptedRequest
}

export class XHRRequestInterceptor {
  private static interceptors: Interceptors = {}
  private static patterns: InterceptionPattern[] = []

  public static init (): void {
    CustomXMLHttpRequest.setCustomLoadEndCallback(
      this.interceptOnceLoaded.bind(this)
    )

    window.XMLHttpRequest = CustomXMLHttpRequest
  }

  public static intercept (url: UrlMatcher, method: string = 'GET', status: StatusMatcher = 200): InterceptedRequest {
    const key: string = hash(`${method}_${url}_${status}`)

    const toBeIntercepted: InterceptedRequest = new InterceptedRequest()

    this.interceptors[key] = toBeIntercepted
    this.patterns.push({ url, method, status})

    return toBeIntercepted
  }

  private static interceptOnceLoaded (request: CustomXMLHttpRequest): void {
    const { responseURL, method: requestMethod, status: responseStatus } = request

    const matchingPatterns: InterceptionPattern[] = this.patterns.filter(pattern => {
      const { url, method, status } = pattern

      return method === requestMethod
      && status instanceof RegExp ? status.test(responseStatus.toString()) : responseStatus === status
      && url instanceof RegExp ? url.test(responseURL) : responseURL.toString().includes(url.toString())
    })

    for (const pattern of matchingPatterns) {
      const { url, method, status } = pattern
      const key: string = hash(`${method}_${url}_${status}`)

      this.interceptors[key]?.applyInterceptions(request)
    }}
}
