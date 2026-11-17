import type { Property } from 'Types/HostelworldSearch'
import type { Search } from 'DTOs/Search'
import type { PropertyPage } from 'DTOs/PropertyPage'
import type { ScheduledProperty } from 'Services/PropertyMetrics'
import type { DisplayedProperty } from 'Services/Hostelworld/Page'

export class ScheduledPropertyFactory {
  public static create (property: Property, search: Search): ScheduledProperty {
    return {
      id: property.id,
      name: property.name,
      overallRating: this.overallRating(property),
      stay: search.getStay()
    }
  }

  public static createFromDisplayed (property: DisplayedProperty, search: Search): ScheduledProperty {
    return {
      id: property.id,
      name: property.name,
      overallRating: property.overallRating,
      stay: search.getStay()
    }
  }

  public static createFromPage (page: PropertyPage): ScheduledProperty {
    return {
      id: page.getId(),
      name: page.getName(),
      overallRating: page.getOverallRating(),
      stay: page.getStay()
    }
  }

  private static overallRating (property: Property): number | null {
    if (!property.overallRating?.overall) return null

    return Number((property.overallRating.overall / 10).toFixed(1))
  }
}
