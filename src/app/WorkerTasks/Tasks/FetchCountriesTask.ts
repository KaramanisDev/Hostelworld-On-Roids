import { AbstractQueuedTask } from './AbstractQueuedTask'
import { VisitorsCountryClient, type PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import type { WorkerTaskArgs, WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type Args = WorkerTaskArgs<'fetch:countries'>
type Result = WorkerTaskPayload<'fetch:countries'>

export class FetchCountriesTask extends AbstractQueuedTask<Args, Result> {
  protected jobId (args: Args): string {
    const [propertyId, , stay]: Args = args

    return `${propertyId}:${stay.getKey()}`
  }

  protected async execute (args: Args): Promise<Result> {
    const [propertyId, propertyName, stay]: Args = args
    const data: PropertyGuestsCountries = await VisitorsCountryClient.fetch(propertyId, stay)

    return { propertyId, propertyName, stay, data }
  }
}
