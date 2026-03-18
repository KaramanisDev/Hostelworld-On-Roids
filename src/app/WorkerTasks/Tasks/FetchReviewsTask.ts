import { AbstractQueuedTask } from './AbstractQueuedTask'
import { ReviewsClient, type PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'

type Args = [propertyId: number, propertyName: string, overallRating: number | null]
type Result = { propertyId: number; propertyName: string; data: PropertyReviews }

export class FetchReviewsTask extends AbstractQueuedTask<Args, Result> {
  protected jobId (args: Args): number {
    const [propertyId]: Args = args

    return propertyId
  }

  protected async execute (args: Args): Promise<Result> {
    const [propertyId, propertyName, overallRating]: Args = args
    const data: PropertyReviews = await ReviewsClient.fetch(propertyId, overallRating)

    return { propertyId, propertyName, data }
  }
}
