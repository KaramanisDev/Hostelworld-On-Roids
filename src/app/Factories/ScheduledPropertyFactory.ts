import type { DisplayedProperty, Property } from 'Types/HostelworldSearch'
import type { Search } from 'DTOs/Search'
import type { ScheduledProperty } from 'Services/PropertyMetricsScheduler'

export class ScheduledPropertyFactory {
  public static create (property: Property | DisplayedProperty, search: Search): ScheduledProperty {
    return {
      id: property.id,
      name: property.name,
      overallRating: this.overallRating(property),
      stay: search.getStay()
    }
  }

  private static overallRating (property: Property | DisplayedProperty): number | null {
    if ('rating' in property) return property.rating?.total || null
    if (!property.overallRating?.overall) return null

    return Number((property.overallRating.overall / 10).toFixed(1))
  }
}
