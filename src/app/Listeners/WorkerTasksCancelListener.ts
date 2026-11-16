import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'
import { PropertyMetricsService } from 'Services/PropertyMetrics'

@Subscribe('worker:tasks:cancel')
export class WorkerTasksCancelListener extends AbstractListener {
  public handle (): void {
    PropertyMetricsService.cancel()
    WorkerRPCProxy.cancelPending()
  }
}
