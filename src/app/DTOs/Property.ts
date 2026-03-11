import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyBadge } from 'Services/PropertyBadgeService'

type PropertyAttributes = {
  id: number
  name: string
  reviewMetrics: ReviewMetrics
  availabilityMetrics: AvailabilityMetrics
  bookedCountries: BookedCountry[]
  badges: PropertyBadge[]
}

export class Property {
  private id!: number
  private name!: string
  private reviewMetrics!: ReviewMetrics
  private availabilityMetrics!: AvailabilityMetrics
  private bookedCountries!: BookedCountry[]
  private badges!: PropertyBadge[]

  constructor (attributes: PropertyAttributes) {
    Object.assign(this, attributes)
  }

  public getId (): number {
    return this.id
  }

  public getName (): string {
    return this.name
  }

  public getReviewMetrics (): ReviewMetrics {
    return this.reviewMetrics
  }

  public getAvailabilityMetrics (): AvailabilityMetrics {
    return this.availabilityMetrics
  }

  public getBookedCountries (): BookedCountry[] {
    return this.bookedCountries
  }

  public getBadges (): PropertyBadge[] {
    return this.badges
  }
}
