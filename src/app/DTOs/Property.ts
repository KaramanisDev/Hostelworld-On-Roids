import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { BookedCountry } from 'DTOs/BookedCountry'

export class Property {
  private id!: number
  private name!: string
  private reviewMetrics!: ReviewMetrics
  private availabilityMetrics!: AvailabilityMetrics
  private bookedCountries!: BookedCountry[]

  constructor (attributes: Record<string, unknown>) {
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
}
