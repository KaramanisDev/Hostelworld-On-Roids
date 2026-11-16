import type { HostelworldPropertyAvailability } from 'Types/HostelworldPropertyAvailability'
import { Stay } from 'DTOs/Stay'
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
    const [current, sampledMax]: [Metrics, Metrics] = await Promise.all([
      this.currentCapacity(propertyId, stay),
      this.possibleMaxCapacity(propertyId, stay.getFrom())
    ])

    const max: Metrics = this.highestMetrics(current, sampledMax)

    return { current, max }
  }

  private static emptyMetrics (): Metrics {
    return { mixed: 0, female: 0, private: 0, total: 0 }
  }

  private static async currentCapacity (propertyId: number, stay: Stay): Promise<Metrics> {
    const availability: HostelworldPropertyAvailability = await this.request(
      propertyId, stay, { cacheInMinutes: 30 }
    )

    return this.toMetrics(availability)
  }

  private static async possibleMaxCapacity (propertyId: number, from: Date): Promise<Metrics> {
    const maxMetrics: Metrics = this.emptyMetrics()

    const daysAfterToCheck: number[] = [10, 20, 30, 45, 60, 70, randomNumber(80, 90)]

    await Promise.all(daysAfterToCheck.map(async days => {
      const fromWithDaysAdded: Date = dateAddDays(from, days)
      const sampledStay: Stay = new Stay({ from: fromWithDaysAdded, to: dateAddDays(fromWithDaysAdded, 3) })

      const availability: HostelworldPropertyAvailability = await promiseFallback(
        this.request(
          propertyId, sampledStay,
          { cacheInMinutes: 24 * 60, networkJitterInMs: this.networkJitterInMs }
        ),
        this.noRooms()
      )
      this.adaptDormBedToMaxCapacity(availability)
      const metrics: Metrics = this.toMetrics(availability)

      for (const key in metrics) {
        const metricsKey: keyof Metrics = key as keyof Metrics

        if (maxMetrics[metricsKey] > metrics[metricsKey]) continue
        maxMetrics[metricsKey] = metrics[metricsKey]
      }
    }))

    return maxMetrics
  }

  private static toMetrics (availability: HostelworldPropertyAvailability): Metrics {
    const metrics: Metrics = this.emptyMetrics()

    const { dorms, privates } = availability.rooms

    for (const dorm of dorms) {
      if (!dorm.basicType.toLowerCase().includes('female')) metrics.mixed += dorm.totalBedsAvailable
      if (dorm.basicType.toLowerCase().includes('female')) metrics.female += dorm.totalBedsAvailable

      metrics.total += dorm.totalBedsAvailable
    }

    for (const room of privates) {
      metrics.private += room.totalRoomsAvailable || 1
      metrics.total += room.totalBedsAvailable || 1
    }

    return metrics
  }

  private static highestMetrics (...sources: Metrics[]): Metrics {
    const result: Metrics = this.emptyMetrics()

    for (const source of sources) {
      for (const key in result) {
        const metricsKey: keyof Metrics = key as keyof Metrics

        if (source[metricsKey] <= result[metricsKey]) continue
        result[metricsKey] = source[metricsKey]
      }
    }

    return result
  }

  private static adaptDormBedToMaxCapacity (
    availability: HostelworldPropertyAvailability
  ): void {
    for (const dorm of availability.rooms.dorms) {
      const capacity: number = Number(dorm.capacity)
      if (!capacity) continue

      dorm.totalBedsAvailable = Math.ceil(
        dorm.totalBedsAvailable / capacity
      ) * capacity
    }
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
