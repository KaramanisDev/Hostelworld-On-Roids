import type { Property } from 'DTOs/Property'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCompositionBuffer, type Metric, type MetricPayload } from 'Services/PropertyCompositionBuffer'
import { PropertyMetricsScheduler } from 'Services/PropertyMetricsScheduler'

@Subscribe('property:metric:collected')
export class PropertyComposerListener extends AbstractListener {
  public handle (metric: Metric, payload: MetricPayload): void {
    const composedProperties: Property[] = PropertyCompositionBuffer.collect(metric, payload)

    for (const property of composedProperties) {
      this.persistPropertyInSession(property)
      this.emit('property:composed', property)
      this.emit('property:render', property)
    }

    PropertyMetricsScheduler.complete(payload.propertyId, metric)
  }
}
