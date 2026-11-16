import { Property } from 'DTOs/Property'
import type { CompletedProperty } from 'Services/PropertyMetrics'
import { PropertyBadgeService, type PropertyBadge, type PropertyMetrics } from 'Services/PropertyBadgeService'

export class PropertyFactory {
  public static create (composition: CompletedProperty): Property {
    const metrics: PropertyMetrics = {
      reviews: composition.reviewMetrics,
      availability: composition.availabilityMetrics
    }
    const badges: PropertyBadge[] = PropertyBadgeService.badgesFor(metrics)

    return new Property({
      id: composition.id,
      name: composition.name,
      stay: composition.stay,
      reviewMetrics: composition.reviewMetrics,
      availabilityMetrics: composition.availabilityMetrics,
      bookedCountries: composition.bookedCountries,
      badges
    })
  }
}
