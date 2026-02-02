import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'

type ReviewsPayload = {
  propertyId: number
  propertyName: string
  data: PropertyReviews
}

@Subscribe('worker:result:fetch:reviews')
export class ReviewsReadyListener extends AbstractListener {
  public handle (payload: ReviewsPayload): void {
    const metrics: ReviewMetrics = new ReviewMetrics(payload.data)
    PropertyCardRenderer.updateReviewMetrics(payload.propertyId, metrics)

    this.emit('property:metric:collected', 'reviews', payload)
  }
}
