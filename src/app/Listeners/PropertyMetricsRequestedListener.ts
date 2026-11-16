import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'
import type { ScheduledProperty } from 'Services/PropertyMetrics'

@Subscribe('property:metrics:requested')
export class PropertyMetricsRequestedListener extends AbstractListener {
  public handle (property: ScheduledProperty): void {
    WorkerRPCProxy.call('fetch:reviews', property.id, property.name, property.overallRating)
    WorkerRPCProxy.call('fetch:availability', property.id, property.name, property.stay)
    WorkerRPCProxy.call('fetch:countries', property.id, property.name, property.stay)
  }
}
