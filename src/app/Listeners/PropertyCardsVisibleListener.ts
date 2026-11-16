import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyMetricsService } from 'Services/PropertyMetrics'

@Subscribe('property:cards:visible')
export class PropertyCardsVisibleListener extends AbstractListener {
  public handle (propertyIds: number[]): void {
    PropertyMetricsService.prioritizeVisible(propertyIds)
  }
}
