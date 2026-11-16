import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyBadge } from 'Services/PropertyBadgeService'

type PropertyAttributes = {
  id: number
  name: string
  from: Date
  to: Date
  reviewMetrics: ReviewMetrics | null
  availabilityMetrics: AvailabilityMetrics | null
  bookedCountries: BookedCountry[]
  badges: PropertyBadge[]
}

export class Property {
  private id!: number
  private name!: string
  private from!: Date
  private to!: Date
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

  public getFrom (): Date {
    return this.from
  }

  public getTo (): Date {
    return this.to
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
