import type { Property } from 'DTOs/Property'
import type { PropertyPage } from 'DTOs/PropertyPage'
import type { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'

@Subscribe('property:page:displayed')
export class PropertyPageDisplayedListener extends AbstractListener {
  private readonly dispatchedPropertyIds: Set<number> = new Set()

  public handle (page: PropertyPage): void {
    PropertyInsightsRenderer.render(page.getId())

    const property: Property | undefined = this.propertyInSession(page.getId())
    if (property && this.isComposedForPageDates(page)) {
      PropertyInsightsRenderer.renderWithData(property)
      return
    }

    this.dispatchedPropertyIds.add(page.getId())

    const from: string = page.getFrom().toISOString()
    const to: string = page.getTo().toISOString()

    this.emit('worker:task:dispatch', 'fetch:reviews', page.getId(), page.getName(), page.getOverallRating())
    this.emit('worker:task:dispatch', 'fetch:availability', page.getId(), page.getName(), from, to)
    this.emit('worker:task:dispatch', 'fetch:countries', page.getId(), page.getName(), from, to)
  }

  private isComposedForPageDates (page: PropertyPage): boolean {
    if (this.dispatchedPropertyIds.has(page.getId())) return false

    const search: Search | undefined = this.latestSearchInSession()
    if (!search) return false

    return search.getFrom().getTime() === page.getFrom().getTime() &&
      search.getTo().getTime() === page.getTo().getTime()
  }
}
