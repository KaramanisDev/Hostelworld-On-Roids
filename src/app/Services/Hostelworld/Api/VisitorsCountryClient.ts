import { HttpClient } from 'Utils/HttpClient'
import type { HttpClientOptions } from 'Utils/HttpClient'
import { dateFormat, promiseFallback } from 'Utils'
import type { Data, HostelworldPropertyGuests } from 'Types/HostelworldPropertyGuests'

export type GuestCountry = {
  code: string
  name: string
  count: number
}

export type PropertyGuestsCountries = GuestCountry[]

export class VisitorsCountryClient {
  private static apiKey: string = 'cvFkm2A4AAefXoupLsChH4jL2mA2VGSyEA0MkRUrqz8Z8x5H'
  private static endpoint: string = 'https://prod.apigee.hostelworld.com/socialcues-service/api/v1/' +
    'properties/{property}/other-guests?from={from}&to={to}'

  static async fetch (property: string, from: Date, to: Date): Promise<PropertyGuestsCountries> {
    const guests: HostelworldPropertyGuests = await this.request(property, from, to)

    return guests.data
      .reduce(
        (carry: PropertyGuestsCountries, datum: Data) => {
          const visitor: GuestCountry | undefined = carry
            .find(country => country.code === datum.countryCode)

          if (visitor) {
            visitor.count++
          } else {
            carry.push({ count: 1, code: datum.countryCode, name: datum.nationality })
          }

          return carry
        },
        []
      )
  }

  private static async request (property: string, from: Date, to: Date): Promise<HostelworldPropertyGuests> {
    const endpoint: string = this.endpoint
      .replaceAll('{to}', dateFormat(to))
      .replaceAll('{property}', property)
      .replaceAll('{from}', dateFormat(from))

    const options: HttpClientOptions = {
      cacheInMinutes: 30,
      headers: { 'Api-Key': this.apiKey }
    }

    return await promiseFallback(
      HttpClient.getJson(endpoint, options),
      { data: [], total: 0 }
    )
  }
}
