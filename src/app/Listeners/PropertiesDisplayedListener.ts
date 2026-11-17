import type { DisplayedProperty } from 'Types/DisplayedProperty'
import type { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { MetricsPropertyFactory } from 'Factories/MetricsPropertyFactory'
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
    const search: Search | undefined = this.session.getLatestSearch()
    if (!search) return

    PropertyMetricsService.schedule(
      properties
        .filter(property => !this.session.getProperty(property.id))
        .map(property => MetricsPropertyFactory.createFromDisplayed(property, search))
    )
  }
}
