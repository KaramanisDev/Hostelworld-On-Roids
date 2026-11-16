import { AbstractQueuedTask } from './AbstractQueuedTask'
import { AvailabilityClient, type PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { Stay } from 'DTOs/Stay'

type Args = [propertyId: number, propertyName: string, stay: Stay]
type Result = { propertyId: number; propertyName: string; stay: Stay; data: PropertyAvailability | null }

export class FetchAvailabilityTask extends AbstractQueuedTask<Args, Result> {
  protected jobId (args: Args): string {
    const [propertyId, , stay]: Args = args

    return `${propertyId}:${stay.getKey()}`
  }

  protected async execute (args: Args): Promise<Result> {
    const [propertyId, propertyName, stay]: Args = args

    const data: PropertyAvailability | null = await AvailabilityClient.fetch(propertyId, stay)

    return { propertyId, propertyName, stay, data }
  }
}
