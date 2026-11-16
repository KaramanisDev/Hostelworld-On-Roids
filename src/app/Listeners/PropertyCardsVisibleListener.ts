import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyMetricsScheduler } from 'Services/PropertyMetricsScheduler'

@Subscribe('property:cards:visible')
export class PropertyCardsVisibleListener extends AbstractListener {
  public handle (propertyIds: number[]): void {
    PropertyMetricsScheduler.prioritizeVisible(propertyIds)
  }
}
