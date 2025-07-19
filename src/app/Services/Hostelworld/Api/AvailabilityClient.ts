import type { HostelworldPropertyAvailability } from 'Types/HostelworldPropertyAvailability'
import { HttpClient } from 'Utils/HttpClient'
import { dateAddDays, dateFormat, delay, promiseFallback, randomNumber } from 'Utils'

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

  public static async fetch (propertyId: number, from: Date, to: Date): Promise<PropertyAvailability> {
    const current: Metrics = await this.currentCapacity(propertyId, from, to)
    const max: Metrics = await this.possibleMaxCapacity(propertyId, from, current)

    return { current, max }
  }

  private static async currentCapacity (propertyId: number, from: Date, to: Date): Promise<Metrics> {
    const availability: HostelworldPropertyAvailability = await this.request(propertyId, from, to, 30)

    return this.toMetrics(availability)
  }

  private static async possibleMaxCapacity (propertyId: number, from: Date, current: Metrics): Promise<Metrics> {
    const maxMetrics: Metrics = {
      ...current
    }

    const daysAfterToCheck: number[] = [10, 20, 30, 45, 60, 70, randomNumber(80, 90)]

    await Promise.all(daysAfterToCheck.map(async days => {
      const fromWithDaysAdded: Date = dateAddDays(from, days)
      const toWithFromPlus3Days: Date = dateAddDays(fromWithDaysAdded, 2)

      await delay(randomNumber(0, 5) * 100)

      const metrics: Metrics = this.toMetrics(
        this.adaptDormBedToMaxCapacity(
          await this.request(propertyId, fromWithDaysAdded, toWithFromPlus3Days, 24 * 60)
        )
      )

      for (const key in metrics) {
        const metricsKey: keyof Metrics = key as keyof Metrics

        if (maxMetrics[metricsKey] > metrics[metricsKey]) continue
        maxMetrics[metricsKey] = metrics[metricsKey]
      }
    }))

    return maxMetrics
  }

  private static toMetrics (availability: HostelworldPropertyAvailability): Metrics {
    const metrics: Metrics = {
      mixed: 0,
      female: 0,
      private: 0,
      total: 0
    }

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

  private static adaptDormBedToMaxCapacity (
    availability: HostelworldPropertyAvailability
  ): HostelworldPropertyAvailability {
    availability.rooms.dorms = availability.rooms.dorms.map(dorm => {
      dorm.totalBedsAvailable = Math.ceil(
        dorm.totalBedsAvailable / Number(dorm.capacity)
      ) * Number(dorm.capacity)

      return dorm
    })
    return availability
  }

  private static async request (
    propertyId: number,
    from: Date,
    to: Date,
    cacheInMinutes?: number
  ): Promise<HostelworldPropertyAvailability> {
    const oneDayInMs: number = 24 * 60 * 60 * 1000
    const nights: number = Math.round(
      Math.abs(from.getTime() - to.getTime()) / oneDayInMs
    )

    const endpoint: string = this.endpoint
      .replaceAll('{from}', dateFormat(from))
      .replaceAll('{nights}', String(nights))
      .replaceAll('{property}', String(propertyId))

    return await promiseFallback(
      HttpClient.getJson(endpoint, { cacheInMinutes }),
      { rooms: { dorms: [], privates: [] } } as unknown as HostelworldPropertyAvailability
    )
  }
}
