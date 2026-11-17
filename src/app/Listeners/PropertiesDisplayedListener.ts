import type { DisplayedProperty } from 'Services/Hostelworld/Page'
import type { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { ScheduledPropertyFactory } from 'Factories/ScheduledPropertyFactory'
import { PropertyMetricsService } from 'Services/PropertyMetrics'

@Subscribe('hostelworld:properties:displayed')
export class PropertiesDisplayedListener extends AbstractListener {
  public handle (properties: DisplayedProperty[]): void {
    PropertyMetricsService.prioritizeDisplayed(properties.map(property => property.id))

    for (const property of properties) {
      this.emit('property:render', property.id)
    }

    this.scheduleMissingMetrics(properties)
  }

  private scheduleMissingMetrics (properties: DisplayedProperty[]): void {
    const search: Search | undefined = this.latestSearchInSession()
    if (!search) return

    PropertyMetricsService.schedule(
      properties
        .filter(property => !this.propertyInSession(property.id))
        .map(property => ScheduledPropertyFactory.createFromDisplayed(property, search))
    )
  }
}
