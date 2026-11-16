import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import type { Metric } from 'Services/PropertyCompositionBuffer'
import { PropertyMetricsScheduler } from 'Services/PropertyMetricsScheduler'

type MetricPayload = {
  propertyId: number
}

@Subscribe('property:metric:collected')
export class PropertyMetricCollectedListener extends AbstractListener {
  public handle (metric: Metric, payload: MetricPayload): void {
    PropertyMetricsScheduler.complete(payload.propertyId, metric)
  }
}
