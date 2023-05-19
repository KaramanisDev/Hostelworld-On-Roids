import { RequestModifier } from './RequestModifier'
import type { InterceptionStage } from './RequestModifier'
import { CustomXMLHttpRequest } from './CustomXMLHttpRequest'

type UrlMatcher = RegExp | URL | string
type StatusMatcher = RegExp | number

type RequestQuery = {
  url: UrlMatcher
  method?: string
  status?: StatusMatcher
}

type Interception = {
  query: RequestQuery,
  modifier: RequestModifier
}

export class XHRRequestInterceptor {
  private static interceptions: Interception[] = []

  public static init (): void {
    CustomXMLHttpRequest.setInterceptCallback(
      this.interceptOn.bind(this)
    )

    window.XMLHttpRequest = CustomXMLHttpRequest
  }

  public static intercept (query: RequestQuery): RequestModifier {
    const modifier: RequestModifier = new RequestModifier()

    this.interceptions.push({ query, modifier })

    return modifier
  }

  private static interceptOn (request: CustomXMLHttpRequest, stage: InterceptionStage): void {
    const interceptions: Interception[] = this.matchedInterceptionsFor(request)

    for (const { modifier } of interceptions) {
      modifier.applyTo(request, stage)
    }
  }

  private static matchedInterceptionsFor (request: CustomXMLHttpRequest): Interception[] {
    const { status: responseStatus, url: requestURL, method: requestMethod } = request

    return this.interceptions.filter(({ query }) => {
      const { url, method, status } = query

      const isMethodMatching: boolean = method
        ? method === requestMethod
        : true
      const isStatusMatching: boolean = status
        ? status instanceof RegExp ? status.test(responseStatus.toString()) : responseStatus === status
        : true
      const isUrlMatching: boolean = url
        ? url instanceof RegExp ? url.test(requestURL.toString()) : requestURL.includes(url.toString())
        : true

      return isMethodMatching && isStatusMatching && isUrlMatching
    })
  }
}
