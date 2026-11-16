import type { Stay } from 'DTOs/Stay'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

type PropertyPayload<TData> = {
  propertyId: number
  propertyName: string
  data: TData
}

type StayPayload<TData> = PropertyPayload<TData> & {
  stay: Stay
}

type WorkerTaskCatalogue = {
  'fetch:reviews': {
    args: [propertyId: number, propertyName: string, overallRating: number | null]
    payload: PropertyPayload<PropertyReviews | null>
  }
  'fetch:availability': {
    args: [propertyId: number, propertyName: string, stay: Stay]
    payload: StayPayload<PropertyAvailability | null>
  }
  'fetch:countries': {
    args: [propertyId: number, propertyName: string, stay: Stay]
    payload: StayPayload<PropertyGuestsCountries>
  }
}

export type WorkerTaskName = keyof WorkerTaskCatalogue

export type WorkerTaskArgs<TTask extends WorkerTaskName> = WorkerTaskCatalogue[TTask]['args']

export type WorkerTaskPayload<TTask extends WorkerTaskName> = WorkerTaskCatalogue[TTask]['payload']
