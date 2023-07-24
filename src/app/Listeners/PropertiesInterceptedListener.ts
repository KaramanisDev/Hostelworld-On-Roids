import type { HostelworldSearchProperties, Property as SearchProperty } from 'Types/HostelworldSearchProperties'
import { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { delay, promisesFulfillSequentially } from 'Utils'
import { PropertyFactory } from 'Factories/PropertyFactory'
import { AbstractListener } from 'Listeners/AbstractListener'

@Subscribe('properties:intercepted')
export class PropertiesInterceptedListener extends AbstractListener {
  public async handle (searchResult: HostelworldSearchProperties): Promise<void> {
    const search: Search | undefined = this.latestSearchInSession()

    if (!search) throw new Error('There is no search in session to properly compose the properties.')

    await promisesFulfillSequentially(
      searchResult.properties.map(
        property => (): Promise<void> => this.composeProperty(property, search)
      )
    )
  }

  private async composeProperty (property: SearchProperty, search: Search): Promise<void> {
    this.emit(
      'property:composed',
      await PropertyFactory.create(property, search)
    )

    return delay(250)
  }
}
