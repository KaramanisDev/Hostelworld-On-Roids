import type { Property } from 'DTOs/Property'
import type { PropertyPage } from 'DTOs/PropertyPage'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { ScheduledPropertyFactory } from 'Factories/ScheduledPropertyFactory'
import { PropertyMetricsService, type MetricsRequest } from 'Services/PropertyMetrics'

@Subscribe('property:page:displayed')
export class PropertyPageDisplayedListener extends AbstractListener {
  public handle (page: PropertyPage): void {
    this.session.updateDisplayedPage(page)
    PropertyInsightsRenderer.render(page)

    const property: Property | undefined = this.session.getProperty(page.getId(), page.getStay())
    if (property) {
      PropertyInsightsRenderer.renderWithData(property, this.session)
      return
    }

    const request: MetricsRequest = PropertyMetricsService.requestFor(ScheduledPropertyFactory.createFromPage(page))

    this.emit('property:metrics:requested', request)
  }
}
