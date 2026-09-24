import type { Property } from 'DTOs/Property'
import type { PropertyPage } from 'DTOs/PropertyPage'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'

@Subscribe('property:page:displayed')
export class PropertyPageDisplayedListener extends AbstractListener {
  public handle (page: PropertyPage): void {
    PropertyInsightsRenderer.render(page)

    const property: Property | undefined = this.propertyInSession(page.getId(), page)
    if (property) {
      PropertyInsightsRenderer.renderWithData(property)
      return
    }

    const from: string = page.getFrom().toISOString()
    const to: string = page.getTo().toISOString()

    this.emit('worker:task:dispatch', 'fetch:reviews', page.getId(), page.getName(), page.getOverallRating())
    this.emit('worker:task:dispatch', 'fetch:availability', page.getId(), page.getName(), from, to)
    this.emit('worker:task:dispatch', 'fetch:countries', page.getId(), page.getName(), from, to)
  }
}
