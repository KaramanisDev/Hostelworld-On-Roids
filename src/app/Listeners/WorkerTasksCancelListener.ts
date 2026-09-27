import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'

@Subscribe('worker:tasks:cancel')
export class WorkerTasksCancelListener extends AbstractListener {
  public handle (): void {
    WorkerRPCProxy.cancelPending()
  }
}
