import type { Dorm, HostelworldPropertyAvailability } from 'Types/HostelworldPropertyAvailability'
import type { BedCounts, PropertyAvailability } from 'Types/PropertyAvailability'

type DormBeds = (dorm: Dorm) => number

export class PropertyAvailabilityFactory {
  public static create (
    current: HostelworldPropertyAvailability,
    capacitySamples: HostelworldPropertyAvailability[]
  ): PropertyAvailability {
    const currentCounts: BedCounts = this.bedCounts(current, dorm => dorm.totalBedsAvailable)
    const sampledCounts: BedCounts[] = capacitySamples.map(
      sample => this.bedCounts(sample, dorm => this.bedsAtFullCapacity(dorm))
    )

    return { current: currentCounts, max: this.highestBedCounts(currentCounts, ...sampledCounts) }
  }

  private static emptyBedCounts (): BedCounts {
    return { mixed: 0, female: 0, private: 0, total: 0 }
  }

  private static bedCounts (availability: HostelworldPropertyAvailability, dormBeds: DormBeds): BedCounts {
    const counts: BedCounts = this.emptyBedCounts()

    const { dorms, privates } = availability.rooms

    for (const dorm of dorms) {
      const beds: number = dormBeds(dorm)

      if (!dorm.basicType.toLowerCase().includes('female')) counts.mixed += beds
      if (dorm.basicType.toLowerCase().includes('female')) counts.female += beds

      counts.total += beds
    }

    for (const room of privates) {
      counts.private += room.totalRoomsAvailable || 1
      counts.total += room.totalBedsAvailable || 1
    }

    return counts
  }

  private static bedsAtFullCapacity (dorm: Dorm): number {
    const capacity: number = Number(dorm.capacity)
    if (!capacity) return dorm.totalBedsAvailable

    return Math.ceil(dorm.totalBedsAvailable / capacity) * capacity
  }

  private static highestBedCounts (...sources: BedCounts[]): BedCounts {
    const result: BedCounts = this.emptyBedCounts()

    for (const source of sources) {
      for (const key in result) {
        const countKey: keyof BedCounts = key as keyof BedCounts

        if (source[countKey] <= result[countKey]) continue
        result[countKey] = source[countKey]
      }
    }

    return result
  }
}
