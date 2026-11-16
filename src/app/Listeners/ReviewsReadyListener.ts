import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type ReviewsPayload = WorkerTaskPayload<'fetch:reviews'>

@Subscribe('worker:result:fetch:reviews')
export class ReviewsReadyListener extends AbstractListener {
  public handle (payload: ReviewsPayload): void {
    const metrics: ReviewMetrics | null = payload.data ? new ReviewMetrics(payload.data) : null
    PropertyCardRenderer.updateReviewMetrics(payload.propertyId, metrics)
    PropertyInsightsRenderer.updateReviewMetrics(payload.propertyId, metrics)

    this.emit('property:metric:collected', 'reviews', payload)
  }
}
