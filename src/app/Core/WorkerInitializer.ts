import { WorkerRPCEndpoint } from 'Communication/WorkerRPCEndpoint'
import { WorkerTaskDispatcher } from 'WorkerTasks/WorkerTaskDispatcher'
import type { WorkerTaskResult } from 'WorkerTasks/WorkerTaskDispatcher'
import { ComposePropertyTask } from 'WorkerTasks/Tasks/ComposePropertyTask'

export class WorkerInitializer {
  public static init (): void {
    this.registerTasks()

    WorkerRPCEndpoint.onRequest<unknown[], WorkerTaskResult>((method: string, args: unknown[]) => {
      return WorkerTaskDispatcher.dispatch(method, args)
    })
  }

  private static registerTasks (): void {
    WorkerTaskDispatcher.register('compose:property', new ComposePropertyTask())
  }
}
