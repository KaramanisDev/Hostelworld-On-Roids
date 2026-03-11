import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'

@Subscribe('worker:task:dispatch')
export class WorkerTaskDispatchListener extends AbstractListener {
  public handle (task: string, ...args: unknown[]): void {
    WorkerRPCProxy.call(task, args)
  }
}
