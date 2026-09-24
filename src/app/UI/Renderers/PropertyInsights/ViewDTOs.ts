import type { Property } from 'DTOs/Property'
import type { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyBadge } from 'Services/PropertyBadgeService'
import type { PropertyCardViewDTO } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyCardViewDTOFactory } from 'UI/Renderers/PropertyCard/ViewDTOs'

export type GuestCountryViewDTO = {
  code: string
  label: string
  count: number
  flag: string
}

export type PropertyInsightsViewDTO = PropertyCardViewDTO & {
  badges: PropertyBadge[]
  countries?: GuestCountryViewDTO[]
}

export class PropertyInsightsLabels {
  public static readonly title: string = 'Guest insights'
  public static readonly countries: string = 'Guests from'
  public static readonly tab: string = 'Insights'
}

export class PropertyInsightsViewDTOFactory {
  public static loading (propertyId: number): PropertyInsightsViewDTO {
    return {
      ...PropertyCardViewDTOFactory.loading(propertyId),
      badges: [],
      countries: undefined
    }
  }

  public static loaded (property: Property): PropertyInsightsViewDTO {
    return {
      ...PropertyCardViewDTOFactory.loaded(property),
      badges: property.getBadges(),
      countries: this.countries(property.getBookedCountries())
    }
  }

  public static countries (bookedCountries: BookedCountry[]): GuestCountryViewDTO[] {
    return [...bookedCountries]
      .sort((first: BookedCountry, second: BookedCountry) => second.getCount() - first.getCount())
      .map((country: BookedCountry) => ({
        code: country.getCode(),
        label: country.getGuestsLabel(),
        count: country.getCount(),
        flag: country.getFlag()
      }))
  }
}
