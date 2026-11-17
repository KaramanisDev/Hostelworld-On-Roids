import type { Property } from 'Types/HostelworldSearch'
import type { DisplayedProperty } from 'Types/DisplayedProperty'
import type { Search } from 'DTOs/Search'
import type { Stay } from 'DTOs/Stay'
import type { PropertyPage } from 'DTOs/PropertyPage'

export type MetricsProperty = {
  id: number
  name: string
  overallRating: number | null
  stay: Stay
}

export class MetricsPropertyFactory {
  public static createFromSearchResult (property: Property, search: Search): MetricsProperty {
    return {
      id: property.id,
      name: property.name,
      overallRating: this.overallRating(property),
      stay: search.getStay()
    }
  }

  public static createFromDisplayed (property: DisplayedProperty, search: Search): MetricsProperty {
    return {
      id: property.id,
      name: property.name,
      overallRating: property.overallRating,
      stay: search.getStay()
    }
  }

  public static createFromPage (page: PropertyPage): MetricsProperty {
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
