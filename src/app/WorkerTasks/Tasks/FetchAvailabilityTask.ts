import { AbstractQueuedTask } from './AbstractQueuedTask'
import { AvailabilityClient } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { WorkerTaskArgs, WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type Args = WorkerTaskArgs<'fetch:availability'>
type Result = WorkerTaskPayload<'fetch:availability'>

export class FetchAvailabilityTask extends AbstractQueuedTask<Args, Result> {
  protected jobId (args: Args): string {
    const [propertyId, stay]: Args = args

    return `${propertyId}:${stay.getKey()}`
  }

  protected async execute (args: Args): Promise<Result> {
    const [propertyId, stay]: Args = args

    return AvailabilityClient.fetch(propertyId, stay)
  }
}
