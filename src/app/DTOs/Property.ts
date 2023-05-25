import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'

export class Property {
  private id!: string
  private name!: string
  private reviewMetrics!: ReviewMetrics
  private availabilityMetrics!: AvailabilityMetrics

  constructor (attributes: Record<string, unknown>) {
    Object.assign(this, attributes)
  }

  public getId (): string {
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

  public hasClosedDown(): boolean {
    return this.getAvailabilityMetrics().getMaxGuests() === 0
  }
}
