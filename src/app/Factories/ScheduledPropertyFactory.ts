import type { Property } from 'Types/HostelworldSearch'
import type { Search } from 'DTOs/Search'
import type { ScheduledProperty } from 'Services/PropertyMetricsScheduler'

export class ScheduledPropertyFactory {
  public static create (property: Property, search: Search): ScheduledProperty {
    const overallRating: number | null = property.overallRating
      ? Number((property.overallRating.overall / 10).toFixed(1))
      : null

    return {
      id: property.id,
      name: property.name,
      overallRating,
      stay: search.getStay()
    }
  }
}
