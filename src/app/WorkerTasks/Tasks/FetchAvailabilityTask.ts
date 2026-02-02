import { AbstractQueuedTask } from './AbstractQueuedTask'
import { AvailabilityClient, type PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'

type Args = [propertyId: number, propertyName: string, from: string, to: string]
type Result = { propertyId: number; propertyName: string; data: PropertyAvailability }

export class FetchAvailabilityTask extends AbstractQueuedTask<Args, Result> {
  protected jobId (args: Args): number {
    const [propertyId]: Args = args

    return propertyId
  }

  protected async execute (args: Args): Promise<Result> {
    const [propertyId, propertyName, from, to]: Args = args

    const data: PropertyAvailability = await AvailabilityClient.fetch(
      propertyId,
      new Date(from),
      new Date(to)
    )

    return { propertyId, propertyName, data }
  }
}
