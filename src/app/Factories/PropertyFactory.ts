import { Property } from 'DTOs/Property'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { BookedCountry } from 'DTOs/BookedCountry'

export class PropertyFactory {
  public static create (
    id: number,
    name: string,
    reviews: PropertyReviews,
    availability: PropertyAvailability,
    countries: PropertyGuestsCountries
  ): Property {
    return new Property({
      id,
      name,
      reviewMetrics: new ReviewMetrics(reviews),
      availabilityMetrics: new AvailabilityMetrics(availability),
      bookedCountries: countries.map(country => new BookedCountry(country))
    })
  }
}
