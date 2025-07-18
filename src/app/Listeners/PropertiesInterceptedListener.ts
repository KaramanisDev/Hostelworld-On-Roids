import type { HostelworldSearch, Property as SearchProperty } from 'Types/HostelworldSearch'
import { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { delay, promisesFulfillSequentially } from 'Utils'
import { AbstractListener } from './AbstractListener'

@Subscribe('hostelworld:search:intercepted')
export class PropertiesInterceptedListener extends AbstractListener {
  public async handle (searchResponse: HostelworldSearch): Promise<void> {
    const search: Search | undefined = this.latestSearchInSession()

    if (!search) throw new Error('There is no search in session to properly compose the properties.')

    await promisesFulfillSequentially(
      searchResponse.properties.map(
        property => (): Promise<void> => this.composeProperty(property, search)
      )
    )
  }

  private async composeProperty (property: SearchProperty, search: Search): Promise<void> {
    this.emit('worker:task:dispatch', 'compose:property', property, search)

    return delay(120)
  }
}
