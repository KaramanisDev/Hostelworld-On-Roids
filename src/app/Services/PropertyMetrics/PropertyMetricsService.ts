import type { Property } from 'DTOs/Property'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyReviews } from 'Types/PropertyReviews'
import type { PropertyAvailability } from 'Types/PropertyAvailability'
import type { PropertyGuestsCountries } from 'Types/PropertyGuestsCountries'
import {
  PropertyMetricsScheduler,
  type MetricsRequest,
  type ScheduledProperty,
  type StartListener
} from './PropertyMetricsScheduler'
import { PropertyCompositionBuffer, type CollectedMetric } from './PropertyCompositionBuffer'

export type FetchedMetric = {
  request: MetricsRequest
} & (
  | { metric: 'reviews', data: PropertyReviews | null }
  | { metric: 'availability', data: PropertyAvailability | null }
  | { metric: 'countries', data: PropertyGuestsCountries }
)

export class PropertyMetricsService {
  public static onStart (listener: StartListener): void {
    PropertyMetricsScheduler.onStart(listener)
  }

  public static schedule (properties: ScheduledProperty[]): void {
    PropertyMetricsScheduler.schedule(properties)
  }

  public static requestFor (property: ScheduledProperty): MetricsRequest {
    return { property }
  }

  public static prioritizeDisplayed (propertyIds: number[]): void {
    PropertyMetricsScheduler.prioritizeDisplayed(propertyIds)
  }

  public static prioritizeVisible (propertyIds: number[]): void {
    PropertyMetricsScheduler.prioritizeVisible(propertyIds)
  }

  public static collectedMetric (fetched: FetchedMetric): CollectedMetric {
    const { id: propertyId, stay, overallRating }: ScheduledProperty = fetched.request.property

    switch (fetched.metric) {
      case 'reviews':
        return {
          metric: 'reviews',
          propertyId,
          reviewMetrics: fetched.data ? new ReviewMetrics({ ...fetched.data, overallRating }) : null
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

  public static collect (request: MetricsRequest, collected: CollectedMetric): void {
    PropertyCompositionBuffer.store(collected, request.property.name)
    PropertyMetricsScheduler.complete(request, collected.metric)
  }

  public static takeComposed (propertyId: number): Property[] {
    return PropertyCompositionBuffer.takeCompleted(propertyId)
  }

  public static cancel (): void {
    PropertyMetricsScheduler.clear()
  }

  public static discardCollected (): void {
    PropertyCompositionBuffer.clear()
  }
}
