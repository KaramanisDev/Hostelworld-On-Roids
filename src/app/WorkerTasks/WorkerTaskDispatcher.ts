import type { WorkerTask, WorkerTaskResult } from './Tasks/WorkerTask'
import type { WorkerTaskName } from './WorkerTaskCatalogue'

export type { WorkerTaskResult }

type WorkerTaskRegistry = Partial<Record<WorkerTaskName, WorkerTask>>

export class WorkerTaskDispatcher {
  private static tasks: WorkerTaskRegistry = {}

  public static register (taskName: WorkerTaskName, handler: WorkerTask): void {
    this.tasks[taskName] = handler
  }

  public static dispatch (taskName: string, args: unknown[], signal: AbortSignal): WorkerTaskResult {
    const handler: WorkerTask | undefined = this.tasks[taskName as WorkerTaskName]

    if (!handler) {
      throw new Error(`No worker task handler registered for: ${taskName}`)
    }

    return handler.handle(args, signal)
  }
}
