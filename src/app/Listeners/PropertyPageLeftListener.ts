import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'

@Subscribe('property:page:left')
export class PropertyPageLeftListener extends AbstractListener {
  public handle (): void {
    PropertyInsightsRenderer.dispose()
  }
}
