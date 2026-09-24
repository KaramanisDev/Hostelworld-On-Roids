import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyFactory } from 'Factories/PropertyFactory'
import { PropertyCompositionBuffer } from 'Services/PropertyCompositionBuffer'
import type { CompletedProperty, Metric, MetricData } from 'Services/PropertyCompositionBuffer'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'

type MetricPayload = {
  propertyId: number
  propertyName: string
  from?: string
  to?: string
  data: MetricData
}

@Subscribe('property:metric:collected')
export class PropertyComposerListener extends AbstractListener {
  public handle (metric: Metric, payload: MetricPayload): void {
    if (metric === 'reviews') {
      PropertyCompositionBuffer.collectReviews(payload.propertyId, payload.data as PropertyReviews)
    } else if (payload.from && payload.to) {
      PropertyCompositionBuffer.collectStayMetric(
        { id: payload.propertyId, name: payload.propertyName, from: new Date(payload.from), to: new Date(payload.to) },
        metric,
        payload.data
      )
    }

    const entries: CompletedProperty[] = PropertyCompositionBuffer.completedEntries(payload.propertyId)
    for (const entry of entries) {
      PropertyCompositionBuffer.remove(entry)
      this.emit('property:composed', PropertyFactory.create(entry))
    }
  }
}
