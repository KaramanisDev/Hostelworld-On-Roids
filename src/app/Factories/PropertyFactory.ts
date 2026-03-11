import { Property } from 'DTOs/Property'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { BookedCountry } from 'DTOs/BookedCountry'
import { PropertyBadgeService, type PropertyBadge, type PropertyMetrics } from 'Services/PropertyBadgeService'

export class PropertyFactory {
  public static create (
    id: number,
    name: string,
    reviews: PropertyReviews,
    availability: PropertyAvailability,
    countries: PropertyGuestsCountries
  ): Property {
    const reviewMetrics: ReviewMetrics = new ReviewMetrics(reviews)
    const availabilityMetrics: AvailabilityMetrics = new AvailabilityMetrics(availability)
    const bookedCountries: BookedCountry[] = countries.map(country => new BookedCountry(country))
    const metrics: PropertyMetrics = { reviews: reviewMetrics, availability: availabilityMetrics }
    const badges: PropertyBadge[] = PropertyBadgeService.badgesFor(metrics)

    return new Property({
      id,
      name,
      reviewMetrics,
      availabilityMetrics,
      bookedCountries,
      badges
    })
  }
}
