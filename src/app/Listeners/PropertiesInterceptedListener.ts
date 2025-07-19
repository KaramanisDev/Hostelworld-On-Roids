import type { Property } from 'Types/HostelworldSearch'
import { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'

@Subscribe('hostelworld:search:intercepted')
export class PropertiesInterceptedListener extends AbstractListener {
  public async handle (properties: Property[]): Promise<void> {
    const search: Search | undefined = this.latestSearchInSession()
    if (!search) throw new Error('There is no search in session to properly compose the properties.')

    for (const property of properties) {
      this.emit('worker:task:dispatch', 'compose:property', property, search)
    }
  }
}
