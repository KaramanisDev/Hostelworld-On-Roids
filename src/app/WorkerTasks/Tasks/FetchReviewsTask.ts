import { AbstractQueuedTask } from './AbstractQueuedTask'
import { ReviewsClient, type PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { WorkerTaskArgs, WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type Args = WorkerTaskArgs<'fetch:reviews'>
type Result = WorkerTaskPayload<'fetch:reviews'>

export class FetchReviewsTask extends AbstractQueuedTask<Args, Result> {
  protected jobId (args: Args): number {
    const [propertyId]: Args = args

    return propertyId
  }

  protected async execute (args: Args): Promise<Result> {
    const [propertyId, propertyName, overallRating]: Args = args
    const data: PropertyReviews | null = await ReviewsClient.fetch(propertyId, overallRating)

    return { propertyId, propertyName, data }
  }
}
