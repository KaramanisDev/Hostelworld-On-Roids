import type { Stay } from 'DTOs/Stay'
import type { PropertyReviews } from 'Types/PropertyReviews'
import type { PropertyAvailability } from 'Types/PropertyAvailability'
import type { PropertyGuestsCountries } from 'Types/PropertyGuestsCountries'

type WorkerTaskCatalogue = {
  'fetch:reviews': {
    args: [propertyId: number]
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
