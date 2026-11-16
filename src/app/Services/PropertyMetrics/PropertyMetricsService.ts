import type { Property } from 'DTOs/Property'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { BookedCountry } from 'DTOs/BookedCountry'
import type { WorkerResult } from 'WorkerTasks/WorkerTaskCatalogue'
import { PropertyMetricsScheduler, type ScheduledProperty } from './PropertyMetricsScheduler'
import { PropertyCompositionBuffer, type CollectedMetric } from './PropertyCompositionBuffer'

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

  public static collect (result: WorkerResult): MetricsProgress {
    const collected: CollectedMetric = this.collectedMetric(result)
    const composed: Property[] = PropertyCompositionBuffer.collect(collected, result.payload.propertyName)

    PropertyMetricsScheduler.complete(collected.propertyId, collected.metric)

    return { collected, composed }
  }

  public static cancel (): void {
    PropertyMetricsScheduler.clear()
  }

  public static discardCollected (): void {
    PropertyCompositionBuffer.clear()
  }

  private static collectedMetric (result: WorkerResult): CollectedMetric {
    switch (result.task) {
      case 'fetch:reviews':
        return {
          metric: 'reviews',
          propertyId: result.payload.propertyId,
          reviewMetrics: result.payload.data ? new ReviewMetrics(result.payload.data) : null
        }
      case 'fetch:availability':
        return {
          metric: 'availability',
          propertyId: result.payload.propertyId,
          stay: result.payload.stay,
          availabilityMetrics: result.payload.data ? new AvailabilityMetrics(result.payload.data) : null
        }
      case 'fetch:countries':
        return {
          metric: 'countries',
          propertyId: result.payload.propertyId,
          stay: result.payload.stay,
          bookedCountries: result.payload.data.map(country => new BookedCountry(country))
        }
    }
  }
}
