import type { Property } from 'Types/HostelworldSearch'
import type { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard/PropertyCardRenderer'

@Subscribe('hostelworld:search:intercepted')
export class PropertiesInterceptedListener extends AbstractListener {
  public async handle (properties: Property[]): Promise<void> {
    this.emit('property:composition:reset')

    const search: Search | undefined = this.latestSearchInSession()
    if (!search) throw new Error('There is no search in session to properly compose the properties.')

    const from: string = search.getFrom().toISOString()
    const to: string = search.getTo().toISOString()

    for (const property of properties) {
      await PropertyCardRenderer.render(property.id, property.name)

      const overallRating: number | null = property.overallRating
        ? Number((property.overallRating.overall / 10).toFixed(1))
        : null

      this.emit('worker:task:dispatch', 'fetch:reviews', property.id, property.name, overallRating)
      this.emit('worker:task:dispatch', 'fetch:availability', property.id, property.name, from, to)
      this.emit('worker:task:dispatch', 'fetch:countries', property.id, property.name, from, to)
    }
  }
}
