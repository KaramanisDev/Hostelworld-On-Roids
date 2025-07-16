import type { WorkerTask, WorkerTaskResult } from './Tasks/WorkerTask'

export type { WorkerTaskResult }

type TaskName = string
type WorkerTaskRegistry = Record<TaskName, WorkerTask>

export class WorkerTaskDispatcher {
  private static tasks: WorkerTaskRegistry = {}

  public static register (taskName: TaskName, handler: WorkerTask): void {
    this.tasks[taskName] = handler
  }

  public static dispatch (taskName: TaskName, args: unknown[]): WorkerTaskResult {
    const handler: WorkerTask | undefined = this.tasks[taskName]

    if (!handler) {
      throw new Error(`No worker task handler registered for: ${taskName}`)
    }

    return handler.handle(...args)
  }
}
