import type { Property } from 'Types/HostelworldSearch'
import type { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { ScheduledPropertyFactory } from 'Factories/ScheduledPropertyFactory'
import { PropertyMetricsService } from 'Services/PropertyMetrics'

@Subscribe('hostelworld:search:intercepted')
export class PropertiesInterceptedListener extends AbstractListener {
  public async handle (properties: Property[]): Promise<void> {
    const search: Search | undefined = this.session.getLatestSearch()
    if (!search) throw new Error('There is no search in session to properly compose the properties.')

    await Promise.allSettled(
      properties.map(property => PropertyCardRenderer.render(property.id, this.session))
    )

    if (!this.session.isLatestSearch(search)) return

    PropertyMetricsService.schedule(
      properties.map(property => ScheduledPropertyFactory.create(property, search))
    )
  }
}
