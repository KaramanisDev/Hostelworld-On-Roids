import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

type PendingProperty = {
  id: number
  name: string
  reviews?: PropertyReviews
  availability?: PropertyAvailability
  countries?: PropertyGuestsCountries
}

export type CompletedProperty = {
  id: number
  name: string
  reviews: PropertyReviews
  availability: PropertyAvailability
  countries: PropertyGuestsCountries
}

export type MetricData = PropertyReviews | PropertyAvailability | PropertyGuestsCountries

export type Metric = 'reviews' | 'availability' | 'countries'

export class PropertyCompositionBuffer {
  private static entries: Map<number, PendingProperty> = new Map()

  public static register (id: number, name: string): void {
    if (this.entries.has(id)) return

    this.entries.set(id, { id, name })
  }

  public static collect (id: number, metric: Metric, data: MetricData): void {
    const entry: PendingProperty | undefined = this.entries.get(id)
    if (!entry) return

    if (metric === 'reviews') entry.reviews = data as PropertyReviews
    if (metric === 'availability') entry.availability = data as PropertyAvailability
    if (metric === 'countries') entry.countries = data as PropertyGuestsCountries
  }

  public static completedEntry (id: number): CompletedProperty | undefined {
    const entry: PendingProperty | undefined = this.entries.get(id)
    if (!entry?.reviews || !entry?.availability || !entry?.countries) return undefined

    return entry as CompletedProperty
  }

  public static remove (id: number): void {
    this.entries.delete(id)
  }

  public static clear (): void {
    this.entries.clear()
  }
}
