import { AbstractQueuedTask } from './AbstractQueuedTask'
import { VisitorsCountryClient, type PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

type Args = [propertyId: number, propertyName: string, from: string, to: string]
type Result = { propertyId: number; propertyName: string; data: PropertyGuestsCountries }

export class FetchCountriesTask extends AbstractQueuedTask<Args, Result> {
  protected jobId (args: Args): number {
    const [propertyId]: Args = args

    return propertyId
  }

  protected async execute (args: Args): Promise<Result> {
    const [propertyId, propertyName, from, to]: Args = args
    const data: PropertyGuestsCountries = await VisitorsCountryClient.fetch(
      propertyId,
      new Date(from),
      new Date(to)
    )

    return { propertyId, propertyName, data }
  }
}
