import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'
import type { FetchedMetric, ScheduledProperty } from 'Services/PropertyMetrics'

@Subscribe('property:metrics:requested')
export class PropertyMetricsRequestedListener extends AbstractListener {
  public handle (property: ScheduledProperty): void {
    void WorkerRPCProxy.call('fetch:reviews', property.id, property.overallRating)
      .then(data => this.emitFetched({ property, metric: 'reviews', data }))
    void WorkerRPCProxy.call('fetch:availability', property.id, property.stay)
      .then(data => this.emitFetched({ property, metric: 'availability', data }))
    void WorkerRPCProxy.call('fetch:countries', property.id, property.stay)
      .then(data => this.emitFetched({ property, metric: 'countries', data }))
  }

  private emitFetched (fetched: FetchedMetric): void {
    this.emit('property:metric:fetched', fetched)
  }
}
