import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyFactory } from 'Factories/PropertyFactory'
import type { Property } from 'DTOs/Property'
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

type MetricData = PropertyReviews | PropertyAvailability | PropertyGuestsCountries

type Metric = 'reviews' | 'availability' | 'countries'

type MetricPayload = {
  propertyId: number
  propertyName: string
  data: MetricData
}

@Subscribe('property:metric:collected')
export class PropertyComposerListener extends AbstractListener {
  private static pending: Map<number, PendingProperty> = new Map()

  public handle (metric: Metric, payload: MetricPayload): void {
    this.ensureRegistered(payload.propertyId, payload.propertyName)

    this.collect(payload.propertyId, metric, payload.data)

    this.composeAndPersistIfReady(payload.propertyId)
  }

  private ensureRegistered (propertyId: number, propertyName: string): void {
    if (PropertyComposerListener.pending.has(propertyId)) return

    PropertyComposerListener.pending.set(propertyId, { id: propertyId, name: propertyName })
  }

  private collect (propertyId: number, metric: Metric, data: MetricData): void {
    const entry: PendingProperty | undefined = PropertyComposerListener.pending.get(propertyId)
    if (!entry) return

    if (metric === 'reviews') entry.reviews = data as PropertyReviews
    if (metric === 'availability') entry.availability = data as PropertyAvailability
    if (metric === 'countries') entry.countries = data as PropertyGuestsCountries
  }

  private composeAndPersistIfReady (propertyId: number): void {
    const entry: PendingProperty | undefined = PropertyComposerListener.pending.get(propertyId)
    if (!entry?.reviews || !entry?.availability || !entry?.countries) return

    PropertyComposerListener.pending.delete(propertyId)

    const property: Property = PropertyFactory.create(
      entry.id,
      entry.name,
      entry.reviews,
      entry.availability,
      entry.countries
    )

    this.emit('property:composed', property)
  }
}
