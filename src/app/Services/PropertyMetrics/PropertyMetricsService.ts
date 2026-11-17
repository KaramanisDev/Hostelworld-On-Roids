import type { Property } from 'DTOs/Property'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import { PropertyMetricsScheduler, type ScheduledProperty } from './PropertyMetricsScheduler'
import { PropertyCompositionBuffer, type CollectedMetric } from './PropertyCompositionBuffer'

export type FetchedMetric = {
  property: ScheduledProperty
} & (
  | { metric: 'reviews', data: PropertyReviews | null }
  | { metric: 'availability', data: PropertyAvailability | null }
  | { metric: 'countries', data: PropertyGuestsCountries }
)

export type MetricsProgress = {
  collected: CollectedMetric
  composed: Property[]
}

type StartListener = (property: ScheduledProperty) => void

export class PropertyMetricsService {
  public static onStart (listener: StartListener): void {
    PropertyMetricsScheduler.onStart(listener)
  }

  public static schedule (properties: ScheduledProperty[]): void {
    PropertyMetricsScheduler.schedule(properties)
  }

  public static prioritizeDisplayed (propertyIds: number[]): void {
    PropertyMetricsScheduler.prioritizeDisplayed(propertyIds)
  }

  public static prioritizeVisible (propertyIds: number[]): void {
    PropertyMetricsScheduler.prioritizeVisible(propertyIds)
  }

  public static collect (fetched: FetchedMetric): MetricsProgress {
    const collected: CollectedMetric = this.collectedMetric(fetched)
    const composed: Property[] = PropertyCompositionBuffer.collect(collected, fetched.property.name)

    PropertyMetricsScheduler.complete(collected.propertyId, collected.metric)

    return { collected, composed }
  }

  public static cancel (): void {
    PropertyMetricsScheduler.clear()
  }

  public static discardCollected (): void {
    PropertyCompositionBuffer.clear()
  }

  private static collectedMetric (fetched: FetchedMetric): CollectedMetric {
    const { id: propertyId, stay }: ScheduledProperty = fetched.property

    switch (fetched.metric) {
      case 'reviews':
        return {
          metric: 'reviews',
          propertyId,
          reviewMetrics: fetched.data ? new ReviewMetrics(fetched.data) : null
        }
      case 'availability':
        return {
          metric: 'availability',
          propertyId,
          stay,
          availabilityMetrics: fetched.data ? new AvailabilityMetrics(fetched.data) : null
        }
      case 'countries':
        return {
          metric: 'countries',
          propertyId,
          stay,
          bookedCountries: fetched.data.map(country => new BookedCountry(country))
        }
    }
  }
}
