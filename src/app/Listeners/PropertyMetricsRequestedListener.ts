import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'
import type { FetchedMetric, MetricsRequest, ScheduledProperty } from 'Services/PropertyMetrics'

@Subscribe('property:metrics:requested')
export class PropertyMetricsRequestedListener extends AbstractListener {
  public handle (request: MetricsRequest): void {
    const { id, overallRating, stay }: ScheduledProperty = request.property

    void WorkerRPCProxy.call('fetch:reviews', id, overallRating)
      .then(data => this.emitFetched({ request, metric: 'reviews', data }))
    void WorkerRPCProxy.call('fetch:availability', id, stay)
      .then(data => this.emitFetched({ request, metric: 'availability', data }))
    void WorkerRPCProxy.call('fetch:countries', id, stay)
      .then(data => this.emitFetched({ request, metric: 'countries', data }))
  }

  private emitFetched (fetched: FetchedMetric): void {
    this.emit('property:metric:fetched', fetched)
  }
}
