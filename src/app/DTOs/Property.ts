import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyBadge } from 'Services/PropertyBadgeService'
import type { Stay } from 'DTOs/Stay'

type PropertyAttributes = {
  id: number
  name: string
  stay: Stay
  reviewMetrics: ReviewMetrics | null
  availabilityMetrics: AvailabilityMetrics | null
  bookedCountries: BookedCountry[]
  badges: PropertyBadge[]
}

export class Property {
  private id!: number
  private name!: string
  private stay!: Stay
  private reviewMetrics!: ReviewMetrics | null
  private availabilityMetrics!: AvailabilityMetrics | null
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

  public getStay (): Stay {
    return this.stay
  }

  public getReviewMetrics (): ReviewMetrics | null {
    return this.reviewMetrics
  }

  public getAvailabilityMetrics (): AvailabilityMetrics | null {
    return this.availabilityMetrics
  }

  public getBookedCountries (): BookedCountry[] {
    return this.bookedCountries
  }

  public getBadges (): PropertyBadge[] {
    return this.badges
  }
}
