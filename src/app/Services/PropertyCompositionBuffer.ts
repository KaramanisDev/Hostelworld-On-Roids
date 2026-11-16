import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import { stayKey } from 'Utils'

export type StayEntry = {
  id: number
  name: string
  from: Date
  to: Date
}

type PendingStay = StayEntry & {
  availability?: PropertyAvailability | null
  countries?: PropertyGuestsCountries
}

export type CompletedProperty = {
  id: number
  name: string
  from: Date
  to: Date
  reviews: PropertyReviews | null
  availability: PropertyAvailability | null
  countries: PropertyGuestsCountries
}

export type MetricData = PropertyReviews | PropertyAvailability | PropertyGuestsCountries | null

export type StayMetric = 'availability' | 'countries'

export type Metric = 'reviews' | StayMetric

export class PropertyCompositionBuffer {
  private static reviews: Map<number, PropertyReviews | null> = new Map()
  private static stays: Map<string, PendingStay> = new Map()

  public static collectReviews (id: number, reviews: PropertyReviews | null): void {
    this.reviews.set(id, reviews)
  }

  public static collectStayMetric (stay: StayEntry, metric: StayMetric, data: MetricData): void {
    const key: string = this.key(stay.id, stay.from, stay.to)
    const pendingStay: PendingStay = this.stays.get(key) ?? { ...stay }

    if (metric === 'availability') pendingStay.availability = data as PropertyAvailability | null
    if (metric === 'countries') pendingStay.countries = data as PropertyGuestsCountries

    this.stays.set(key, pendingStay)
  }

  public static completedEntries (id: number): CompletedProperty[] {
    const reviews: PropertyReviews | null | undefined = this.reviews.get(id)
    if (reviews === undefined) return []

    const completed: CompletedProperty[] = []
    for (const stay of this.stays.values()) {
      if (stay.id !== id || stay.availability === undefined || stay.countries === undefined) continue

      completed.push({ ...stay, reviews, availability: stay.availability, countries: stay.countries })
    }

    return completed
  }

  public static remove (entry: CompletedProperty): void {
    this.stays.delete(this.key(entry.id, entry.from, entry.to))
  }

  public static clear (): void {
    this.reviews.clear()
    this.stays.clear()
  }

  private static key (id: number, from: Date, to: Date): string {
    return `${id}|${stayKey(from, to)}`
  }
}
