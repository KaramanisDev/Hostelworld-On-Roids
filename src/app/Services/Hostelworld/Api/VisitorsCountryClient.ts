import { HttpClient } from 'Utils/HttpClient'
import type { HttpClientOptions } from 'Utils/HttpClient'
import { dateFormat, promiseFallback } from 'Utils'
import type { Data, HostelworldPropertyGuests } from 'Types/HostelworldPropertyGuests'
import type { Stay } from 'DTOs/Stay'
import type { GuestCountry, PropertyGuestsCountries } from 'Types/PropertyGuestsCountries'

export class VisitorsCountryClient {
  private static readonly apiKey: string = 'cvFkm2A4AAefXoupLsChH4jL2mA2VGSyEA0MkRUrqz8Z8x5H'
  private static readonly endpoint: string = 'https://prod.apigee.hostelworld.com/socialcues-service/api/v1/' +
    'properties/{property}/other-guests?from={from}&to={to}'

  public static async fetch (propertyId: number, stay: Stay): Promise<PropertyGuestsCountries> {
    return await promiseFallback(this.countries(propertyId, stay), [])
  }

  private static async countries (propertyId: number, stay: Stay): Promise<PropertyGuestsCountries> {
    const guests: HostelworldPropertyGuests = await this.request(propertyId, stay)

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

  private static async request (propertyId: number, stay: Stay): Promise<HostelworldPropertyGuests> {
    const endpoint: string = this.endpoint
      .replaceAll('{to}', dateFormat(stay.getTo()))
      .replaceAll('{property}', String(propertyId))
      .replaceAll('{from}', dateFormat(stay.getFrom()))

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
