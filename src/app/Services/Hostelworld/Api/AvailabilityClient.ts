import type { HostelworldPropertyAvailability } from 'Types/HostelworldPropertyAvailability'
import { Stay } from 'DTOs/Stay'
import { PropertyAvailabilityFactory } from 'Factories/PropertyAvailabilityFactory'
import { HttpClient, type HttpClientOptions } from 'Utils/HttpClient'
import { dateAddDays, dateFormat, promiseFallback, randomNumber } from 'Utils'

export type Metrics = {
  mixed: number
  female: number
  private: number
  total: number
}

export type PropertyAvailability = {
  max: Metrics
  current: Metrics
}

export class AvailabilityClient {
  private static readonly endpoint: string = 'https://prod.apigee.hostelworld.com/legacy-hwapi-service/2.2/' +
    'properties/{property}/availability/?date-start={from}&num-nights={nights}'

  private static readonly networkJitterInMs: number = 300

  public static async fetch (propertyId: number, stay: Stay): Promise<PropertyAvailability | null> {
    return await promiseFallback(this.availability(propertyId, stay), null)
  }

  private static async availability (propertyId: number, stay: Stay): Promise<PropertyAvailability> {
    const [current, capacitySamples]: [HostelworldPropertyAvailability, HostelworldPropertyAvailability[]] =
      await Promise.all([
        this.request(propertyId, stay, { cacheInMinutes: 30 }),
        this.capacitySamples(propertyId, stay.getFrom())
      ])

    return PropertyAvailabilityFactory.create(current, capacitySamples)
  }

  private static async capacitySamples (propertyId: number, from: Date): Promise<HostelworldPropertyAvailability[]> {
    const daysAfterToCheck: number[] = [10, 20, 30, 45, 60, 70, randomNumber(80, 90)]

    return await Promise.all(daysAfterToCheck.map(async days => {
      const fromWithDaysAdded: Date = dateAddDays(from, days)
      const sampledStay: Stay = new Stay({ from: fromWithDaysAdded, to: dateAddDays(fromWithDaysAdded, 3) })

      return await promiseFallback(
        this.request(
          propertyId, sampledStay,
          { cacheInMinutes: 24 * 60, networkJitterInMs: this.networkJitterInMs }
        ),
        this.noRooms()
      )
    }))
  }

  private static async request (
    propertyId: number,
    stay: Stay,
    options: HttpClientOptions
  ): Promise<HostelworldPropertyAvailability> {
    const endpoint: string = this.endpoint
      .replaceAll('{from}', dateFormat(stay.getFrom()))
      .replaceAll('{nights}', String(stay.getNights()))
      .replaceAll('{property}', String(propertyId))

    try {
      return await HttpClient.getJson(endpoint, options)
    } catch (error) {
      if (!HttpClient.isNotFound(error)) throw error

      return this.noRooms()
    }
  }

  private static noRooms (): HostelworldPropertyAvailability {
    return { rooms: { dorms: [], privates: [] } } as unknown as HostelworldPropertyAvailability
  }
}
