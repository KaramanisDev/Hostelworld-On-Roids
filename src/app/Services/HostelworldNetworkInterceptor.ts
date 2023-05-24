import type { Callback } from 'Types/General'
import type { HostelworldSearchProperties } from 'Types/HostelworldSearchProperties'
import type { HostelworldSearchUnavailableProperties } from 'Types/HostelworldSearchUnavailableProperties'
import { XHRRequestInterceptor } from 'Utils/XHRRequestInterceptor'

type HostelworldSearch = HostelworldSearchProperties | HostelworldSearchUnavailableProperties

export class HostelworldNetworkInterceptor {
  private static searchPropertiesUrl: string = 'https://prod.apigee.hostelworld.com/legacy-hwapi-service/2.2/cities'
  private static citiesSocialCuesUrl: string = 'https://prod.apigee.hostelworld.com/socialcues-service/api/v1/cities'
  private static searchUnavailablePropertiesRegex: RegExp =
    /^https:\/\/prod\.apigee\.hostelworld\.com\/legacy-hwapi-service\/2\.2\/cities\/.+\/properties\/no-availabilities/

  public static onSearchProperties (callback: Callback<HostelworldSearch>): typeof this {
    const parseResponseWithCallback: Callback<string> = (response: string): string => {
      const parsed: HostelworldSearch = JSON.parse(response)

      return JSON.stringify(callback(parsed))
    }

    XHRRequestInterceptor
      .intercept({ url: this.searchPropertiesUrl, status: 200 })
      .withResponse(parseResponseWithCallback)

    return this
  }

  public static increaseSearchUnavailablePropertiesPerPage (): typeof this {
    const newPerPage: number = 100

    const increasePerPage: Callback<string> = (requestUrl: string): string => {
      const url = new URL(requestUrl)

      if (!url.searchParams.has('per-page')) return url.toString()
      url.searchParams.set('per-page', String(newPerPage))

      return url.toString()
    }

    XHRRequestInterceptor
      .intercept({ url: this.searchUnavailablePropertiesRegex })
      .withUrl(increasePerPage)

    return this
  }

  public static guardAgainstFailingCitySocialCues (): typeof this {
    XHRRequestInterceptor
      .intercept({ url: this.citiesSocialCuesUrl })
      .shouldNotFail(JSON.stringify({ nationalities: [], profileImages: { all: [], soloPax: [] } }))
      .withTimeout(90 * 1000)

    return this
  }
}
