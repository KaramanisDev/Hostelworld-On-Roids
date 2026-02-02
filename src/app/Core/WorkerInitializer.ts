import { WorkerRPCEndpoint } from 'Communication/WorkerRPCEndpoint'
import { WorkerTaskDispatcher } from 'WorkerTasks/WorkerTaskDispatcher'
import type { WorkerTaskResult } from 'WorkerTasks/WorkerTaskDispatcher'
import { FetchReviewsTask } from 'WorkerTasks/Tasks/FetchReviewsTask'
import { FetchAvailabilityTask } from 'WorkerTasks/Tasks/FetchAvailabilityTask'
import { FetchCountriesTask } from 'WorkerTasks/Tasks/FetchCountriesTask'

export class WorkerInitializer {
  public static init (): void {
    this.registerTasks()

    WorkerRPCEndpoint.onRequest<unknown[], WorkerTaskResult>((method: string, args: unknown[]) => {
      return WorkerTaskDispatcher.dispatch(method, args)
    })
  }

  private static registerTasks (): void {
    WorkerTaskDispatcher.register('fetch:reviews', new FetchReviewsTask())
    WorkerTaskDispatcher.register('fetch:availability', new FetchAvailabilityTask())
    WorkerTaskDispatcher.register('fetch:countries', new FetchCountriesTask())
  }
}
