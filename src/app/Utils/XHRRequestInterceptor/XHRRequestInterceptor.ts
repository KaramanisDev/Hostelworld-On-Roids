import type { InterceptionStage } from './RequestModifier'
import { objectsAreEqual } from 'Utils'
import { RequestModifier } from './RequestModifier'
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
  modifiers: RequestModifier[]
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
    const interception: Interception | undefined = this.interceptions.find(
      interception => objectsAreEqual(interception.query, query)
    )

    if (interception) {
      interception.modifiers.push(modifier)
    } else {
      this.interceptions.push({ query, modifiers: [modifier] })
    }

    return modifier
  }

  private static interceptOn (request: CustomXMLHttpRequest, stage: InterceptionStage): void {
    const interceptions: Interception[] = this.matchedInterceptionsFor(request)

    for (const { modifiers } of interceptions) {
      for (const modifier of modifiers) {
        modifier.applyTo(request, stage)
      }
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
        ? status instanceof RegExp ? status.test(String(responseStatus)) : responseStatus === status
        : true
      const isUrlMatching: boolean = url
        ? url instanceof RegExp ? url.test(String(requestURL)) : requestURL.includes(String(url))
        : true

      return isMethodMatching && isStatusMatching && isUrlMatching
    })
  }
}
