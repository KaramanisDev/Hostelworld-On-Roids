import type { Property } from 'DTOs/Property'
import type { Stay } from 'DTOs/Stay'
import { PropertyFactory } from 'Factories/PropertyFactory'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import type { WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type StayPayload = WorkerTaskPayload<'fetch:availability' | 'fetch:countries'>

type StayMetrics = {
  availability?: PropertyAvailability | null
  countries?: PropertyGuestsCountries
}

type PendingStay = StayMetrics & {
  id: number
  name: string
  stay: Stay
}

export type CompletedProperty = {
  id: number
  name: string
  stay: Stay
  reviews: PropertyReviews | null
  availability: PropertyAvailability | null
  countries: PropertyGuestsCountries
}

export type Metric = 'reviews' | 'availability' | 'countries'

export type MetricPayload = WorkerTaskPayload<'fetch:reviews'> | StayPayload

export class PropertyCompositionBuffer {
  private static reviews: Map<number, PropertyReviews | null> = new Map()
  private static stays: Map<string, PendingStay> = new Map()

  public static collect (metric: Metric, payload: MetricPayload): Property[] {
    this.store(metric, payload)

    const completed: CompletedProperty[] = this.completedEntries(payload.propertyId)
    for (const entry of completed) {
      this.stays.delete(entry.stay.getPropertyKey(entry.id))
    }

    return completed.map(entry => PropertyFactory.create(entry))
  }

  public static clear (): void {
    this.reviews.clear()
    this.stays.clear()
  }

  private static store (metric: Metric, payload: MetricPayload): void {
    switch (metric) {
      case 'reviews':
        this.reviews.set(payload.propertyId, payload.data as PropertyReviews | null)
        return
      case 'availability':
        this.updateStay(payload as StayPayload, { availability: payload.data as PropertyAvailability | null })
        return
      case 'countries':
        this.updateStay(payload as StayPayload, { countries: payload.data as PropertyGuestsCountries })
    }
  }

  private static updateStay (payload: StayPayload, metrics: StayMetrics): void {
    const key: string = payload.stay.getPropertyKey(payload.propertyId)
    const pendingStay: PendingStay = this.stays.get(key) ?? {
      id: payload.propertyId,
      name: payload.propertyName,
      stay: payload.stay
    }

    this.stays.set(key, { ...pendingStay, ...metrics })
  }

  private static completedEntries (id: number): CompletedProperty[] {
    const reviews: PropertyReviews | null | undefined = this.reviews.get(id)
    if (reviews === undefined) return []

    const completed: CompletedProperty[] = []
    for (const stay of this.stays.values()) {
      if (stay.id !== id || stay.availability === undefined || stay.countries === undefined) continue

      completed.push({ ...stay, reviews, availability: stay.availability, countries: stay.countries })
    }

    return completed
  }
}
