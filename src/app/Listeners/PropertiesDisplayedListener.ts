import type { Property } from 'Types/HostelworldSearch'
import type { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { ScheduledPropertyFactory } from 'Factories/ScheduledPropertyFactory'
import { PropertyMetricsScheduler } from 'Services/PropertyMetricsScheduler'

@Subscribe('hostelworld:properties:displayed')
export class PropertiesDisplayedListener extends AbstractListener {
  public handle (properties: Property[]): void {
    PropertyMetricsScheduler.prioritizeDisplayed(properties.map(property => property.id))

    for (const property of properties) {
      this.emit('property:render', property.id)
    }

    this.scheduleMissingMetrics(properties)
  }

  private scheduleMissingMetrics (properties: Property[]): void {
    const search: Search | undefined = this.latestSearchInSession()
    if (!search) return

    PropertyMetricsScheduler.schedule(
      properties
        .filter(property => !this.propertyInSession(property.id))
        .map(property => ScheduledPropertyFactory.create(property, search))
    )
  }
}
