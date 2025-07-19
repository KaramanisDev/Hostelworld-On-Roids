import type { HostelworldSearch } from 'Types/HostelworldSearch'
import { XHRRequestInterceptor } from 'Utils/XHRRequestInterceptor'

export class SearchApiRequestsInterceptor {
  private static searchPropertiesRegex: RegExp = /cities\/\d+\/properties\/\?.*(?=date-start=(?!1943-04-19))/
  private static searchAllPropertiesRegex: RegExp = /cities\/\d+\/properties\/\?.*date-start=1943-04-19/
  private static searchAllPropertiesWithoutDateStartRegex: RegExp = /cities\/\d+\/properties\/(?!.*[?&]date-start=)/

  public static interceptSearch (
    UrlCallback: Callback<URL>,
    responseCallback: Callback<HostelworldSearch>
  ): typeof this {
    const parseUrlWithCallback: Callback<string> = (url: string): string => {
      const parsed: URL = new URL(url)

      return UrlCallback(parsed).toString()
    }

    const parseResponseWithCallback: Callback<string> = (response: string): string => {
      const parsed: HostelworldSearch = JSON.parse(response)

      return JSON.stringify(responseCallback(parsed))
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
    const updateCustomUrlToSearchAll: Callback<string> = (url: string): string => {
      const parsed: URL = new URL(url)
      parsed.searchParams.delete('guests')
      parsed.searchParams.delete('num-nights')
      parsed.searchParams.delete('date-start')

      return parsed.toString()
    }

    const parseResponseWithCallback: Callback<string> = (response: string): string => {
      const parsed: HostelworldSearch = JSON.parse(response)

      return JSON.stringify(responseCallback(parsed))
    }

    XHRRequestInterceptor
      .intercept({ url: this.searchAllPropertiesRegex })
      .withUrl(updateCustomUrlToSearchAll)

    XHRRequestInterceptor
      .intercept({ url: this.searchAllPropertiesWithoutDateStartRegex, status: 200 })
      .withResponse(parseResponseWithCallback)

    return this
  }
}
