import type { Stay } from 'DTOs/Stay'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyBadge } from 'Types/PropertyBadge'
import { Property } from 'DTOs/Property'
import { PropertyBadgeService } from 'Services/PropertyBadgeService'

type CollectedReviews = {
  metric: 'reviews'
  propertyId: number
  reviewMetrics: ReviewMetrics | null
}

type CollectedAvailability = {
  metric: 'availability'
  propertyId: number
  stay: Stay
  availabilityMetrics: AvailabilityMetrics | null
}

type CollectedCountries = {
  metric: 'countries'
  propertyId: number
  stay: Stay
  bookedCountries: BookedCountry[]
}

type CollectedStayMetric = CollectedAvailability | CollectedCountries

type StayMetrics = {
  availabilityMetrics?: AvailabilityMetrics | null
  bookedCountries?: BookedCountry[]
}

type PendingStay = StayMetrics & {
  id: number
  name: string
  stay: Stay
}

type CompletedStay = PendingStay & Required<StayMetrics>

export type CollectedMetric = CollectedReviews | CollectedStayMetric

export type Metric = CollectedMetric['metric']

type CompletedProperty = {
  id: number
  name: string
  stay: Stay
  reviewMetrics: ReviewMetrics | null
  availabilityMetrics: AvailabilityMetrics | null
  bookedCountries: BookedCountry[]
}

export class PropertyCompositionBuffer {
  private static reviews: Map<number, ReviewMetrics | null> = new Map()
  private static stays: Map<string, PendingStay> = new Map()

  public static store (collected: CollectedMetric, propertyName: string): void {
    switch (collected.metric) {
      case 'reviews':
        this.reviews.set(collected.propertyId, collected.reviewMetrics)
        return
      case 'availability':
        this.updateStay(collected, propertyName, { availabilityMetrics: collected.availabilityMetrics })
        return
      case 'countries':
        this.updateStay(collected, propertyName, { bookedCountries: collected.bookedCountries })
    }
  }

  public static takeCompleted (propertyId: number): Property[] {
    const completed: CompletedProperty[] = this.completedEntries(propertyId)
    for (const entry of completed) {
      this.stays.delete(entry.stay.getPropertyKey(entry.id))
    }

    return completed.map(entry => this.property(entry))
  }

  public static clear (): void {
    this.reviews.clear()
    this.stays.clear()
  }

  private static updateStay (collected: CollectedStayMetric, propertyName: string, metrics: StayMetrics): void {
    const key: string = collected.stay.getPropertyKey(collected.propertyId)
    const pendingStay: PendingStay = this.stays.get(key) ?? {
      id: collected.propertyId,
      name: propertyName,
      stay: collected.stay
    }

    this.stays.set(key, { ...pendingStay, ...metrics })
  }

  private static completedEntries (propertyId: number): CompletedProperty[] {
    const reviewMetrics: ReviewMetrics | null | undefined = this.reviews.get(propertyId)
    if (reviewMetrics === undefined) return []

    const completed: CompletedProperty[] = []
    for (const stay of this.stays.values()) {
      if (stay.id !== propertyId || !this.isCompleted(stay)) continue

      completed.push({ ...stay, reviewMetrics })
    }

    return completed
  }

  private static isCompleted (stay: PendingStay): stay is CompletedStay {
    return stay.availabilityMetrics !== undefined && stay.bookedCountries !== undefined
  }

  private static property (completed: CompletedProperty): Property {
    const badges: PropertyBadge[] = PropertyBadgeService.badgesFor({
      reviews: completed.reviewMetrics,
      availability: completed.availabilityMetrics
    })

    return new Property({ ...completed, badges })
  }
}
