import type { Stay } from 'DTOs/Stay'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

type WorkerTaskCatalogue = {
  'fetch:reviews': {
    args: [propertyId: number, overallRating: number | null]
    payload: PropertyReviews | null
  }
  'fetch:availability': {
    args: [propertyId: number, stay: Stay]
    payload: PropertyAvailability | null
  }
  'fetch:countries': {
    args: [propertyId: number, stay: Stay]
    payload: PropertyGuestsCountries
  }
}

export type WorkerTaskName = keyof WorkerTaskCatalogue

export type WorkerTaskArgs<TTask extends WorkerTaskName> = WorkerTaskCatalogue[TTask]['args']

export type WorkerTaskPayload<TTask extends WorkerTaskName> = WorkerTaskCatalogue[TTask]['payload']
