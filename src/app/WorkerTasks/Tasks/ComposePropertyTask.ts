import type { WorkerTask, WorkerTaskResult } from './WorkerTask'
import { Search } from 'DTOs/Search'
import type { Property } from 'DTOs/Property'
import type { Property as HostelworldProperty } from 'Types/HostelworldSearch'
import { PropertyFactory } from 'Factories/PropertyFactory'

export class ComposePropertyTask implements WorkerTask {
  public handle (property: HostelworldProperty, search: Search): WorkerTaskResult<Property> {
    return PropertyFactory.create(property, search)
  }
}
