import type { HostelworldSearch } from 'Types/HostelworldSearch'
import { XHRRequestInterceptor, type ResponseCallback } from 'Utils/XHRRequestInterceptor'

type SearchResponseCallback = (search: HostelworldSearch, url: URL) => HostelworldSearch

export class SearchApiRequestsInterceptor {
  private static searchPropertiesRegex: RegExp = /cities\/\d+\/properties\/\?.*date-start=/
  private static searchAllPropertiesRegex: RegExp = /cities\/\d+\/properties\/(?!.*[?&]date-start=)/

  public static interceptSearch (
    UrlCallback: Callback<URL>,
    responseCallback: SearchResponseCallback
  ): typeof this {
    const parseUrlWithCallback: Callback<string> = (url: string): string => {
      const parsed: URL = new URL(url)

      return UrlCallback(parsed).toString()
    }

    const parseResponseWithCallback: ResponseCallback = (response: string, url: string): string => {
      const parsed: HostelworldSearch = JSON.parse(response)

      return JSON.stringify(responseCallback(parsed, new URL(url)))
    }

    XHRRequestInterceptor
      .intercept({ url: this.searchPropertiesRegex })
      .withUrl(parseUrlWithCallback)

    XHRRequestInterceptor
      .intercept({ url: this.searchPropertiesRegex, status: 200 })
      .withResponse(parseResponseWithCallback)

    return this
  }

  public static interceptSearchAll (responseCallback: Callback<HostelworldSearch>): typeof this {
    const parseResponseWithCallback: Callback<string> = (response: string): string => {
      const parsed: HostelworldSearch = JSON.parse(response)

      return JSON.stringify(responseCallback(parsed))
    }

    XHRRequestInterceptor
      .intercept({ url: this.searchAllPropertiesRegex, status: 200 })
      .withResponse(parseResponseWithCallback)

    return this
  }
}
