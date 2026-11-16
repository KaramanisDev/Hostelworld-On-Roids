import { Property } from 'DTOs/Property'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { BookedCountry } from 'DTOs/BookedCountry'
import type { CompletedProperty } from 'Services/PropertyCompositionBuffer'
import { PropertyBadgeService, type PropertyBadge, type PropertyMetrics } from 'Services/PropertyBadgeService'

export class PropertyFactory {
  public static create (composition: CompletedProperty): Property {
    const reviewMetrics: ReviewMetrics | null = composition.reviews ? new ReviewMetrics(composition.reviews) : null
    const availabilityMetrics: AvailabilityMetrics | null = composition.availability
      ? new AvailabilityMetrics(composition.availability)
      : null
    const bookedCountries: BookedCountry[] = composition.countries.map(country => new BookedCountry(country))
    const metrics: PropertyMetrics = { reviews: reviewMetrics, availability: availabilityMetrics }
    const badges: PropertyBadge[] = PropertyBadgeService.badgesFor(metrics)

    return new Property({
      id: composition.id,
      name: composition.name,
      stay: composition.stay,
      reviewMetrics,
      availabilityMetrics,
      bookedCountries,
      badges
    })
  }
}
