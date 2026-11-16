import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'
import { PropertyMetricsScheduler } from 'Services/PropertyMetricsScheduler'

@Subscribe('worker:tasks:cancel')
export class WorkerTasksCancelListener extends AbstractListener {
  public handle (): void {
    PropertyMetricsScheduler.clear()
    WorkerRPCProxy.cancelPending()
  }
}
