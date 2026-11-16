import type { Dorm, HostelworldPropertyAvailability } from 'Types/HostelworldPropertyAvailability'
import type { Metrics, PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'

type DormBeds = (dorm: Dorm) => number

export class PropertyAvailabilityFactory {
  public static create (
    current: HostelworldPropertyAvailability,
    capacitySamples: HostelworldPropertyAvailability[]
  ): PropertyAvailability {
    const currentMetrics: Metrics = this.metrics(current, dorm => dorm.totalBedsAvailable)
    const sampledMetrics: Metrics[] = capacitySamples.map(
      sample => this.metrics(sample, dorm => this.bedsAtFullCapacity(dorm))
    )

    return { current: currentMetrics, max: this.highestMetrics(currentMetrics, ...sampledMetrics) }
  }

  private static emptyMetrics (): Metrics {
    return { mixed: 0, female: 0, private: 0, total: 0 }
  }

  private static metrics (availability: HostelworldPropertyAvailability, dormBeds: DormBeds): Metrics {
    const metrics: Metrics = this.emptyMetrics()

    const { dorms, privates } = availability.rooms

    for (const dorm of dorms) {
      const beds: number = dormBeds(dorm)

      if (!dorm.basicType.toLowerCase().includes('female')) metrics.mixed += beds
      if (dorm.basicType.toLowerCase().includes('female')) metrics.female += beds

      metrics.total += beds
    }

    for (const room of privates) {
      metrics.private += room.totalRoomsAvailable || 1
      metrics.total += room.totalBedsAvailable || 1
    }

    return metrics
  }

  private static bedsAtFullCapacity (dorm: Dorm): number {
    const capacity: number = Number(dorm.capacity)
    if (!capacity) return dorm.totalBedsAvailable

    return Math.ceil(dorm.totalBedsAvailable / capacity) * capacity
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
}
