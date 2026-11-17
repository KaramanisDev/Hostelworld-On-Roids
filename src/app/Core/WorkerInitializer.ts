import { WorkerRPCServer } from 'Communication/WorkerRPCServer'
import { WorkerTaskDispatcher } from 'WorkerTasks/WorkerTaskDispatcher'
import type { WorkerTaskResult } from 'WorkerTasks/WorkerTaskDispatcher'
import { FetchReviewsTask } from 'WorkerTasks/Tasks/FetchReviewsTask'
import { FetchAvailabilityTask } from 'WorkerTasks/Tasks/FetchAvailabilityTask'
import { FetchCountriesTask } from 'WorkerTasks/Tasks/FetchCountriesTask'
import { HttpClient } from 'Utils/HttpClient'

export class WorkerInitializer {
  public static init (): void {
    this.registerTasks()

    WorkerRPCServer.onRequest<unknown[], WorkerTaskResult>((task: string, args: unknown[], signal: AbortSignal) => {
      return WorkerTaskDispatcher.dispatch(task, args, signal)
    })

    void HttpClient.purgeExpiredCache()
  }

  private static registerTasks (): void {
    WorkerTaskDispatcher.register('fetch:reviews', new FetchReviewsTask())
    WorkerTaskDispatcher.register('fetch:availability', new FetchAvailabilityTask())
    WorkerTaskDispatcher.register('fetch:countries', new FetchCountriesTask())
  }
}
