import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import type { Stay } from 'DTOs/Stay'
import { PropertyFactory } from 'Factories/PropertyFactory'
import { PropertyCompositionBuffer } from 'Services/PropertyCompositionBuffer'
import type { CompletedProperty, Metric, MetricData } from 'Services/PropertyCompositionBuffer'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'

type MetricPayload = {
  propertyId: number
  propertyName: string
  stay?: Stay
  data: MetricData
}

@Subscribe('property:metric:collected')
export class PropertyComposerListener extends AbstractListener {
  public handle (metric: Metric, payload: MetricPayload): void {
    if (metric === 'reviews') {
      PropertyCompositionBuffer.collectReviews(payload.propertyId, payload.data as PropertyReviews | null)
    } else if (payload.stay) {
      PropertyCompositionBuffer.collectStayMetric(
        { id: payload.propertyId, name: payload.propertyName, stay: payload.stay },
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
