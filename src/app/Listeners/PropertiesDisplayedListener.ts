import type { Property } from 'Types/HostelworldSearch'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyMetricsScheduler } from 'Services/PropertyMetricsScheduler'

@Subscribe('hostelworld:properties:displayed')
export class PropertiesDisplayedListener extends AbstractListener {
  public handle (properties: Property[]): void {
    PropertyMetricsScheduler.prioritizeDisplayed(properties.map(property => property.id))

    for (const property of properties) {
      this.emit('property:render', property.id)
    }
  }
}
