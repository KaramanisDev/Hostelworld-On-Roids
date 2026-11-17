import type { Property } from 'DTOs/Property'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from 'Listeners/AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'

@Subscribe('property:render')
export class PropertyRenderListener extends AbstractListener {
  public async handle (propertyOrId: Property | number): Promise<void> {
    const propertyToRender: Property | undefined = typeof propertyOrId === 'number'
      ? this.session.getProperty(propertyOrId)
      : propertyOrId

    if (!propertyToRender && typeof propertyOrId === 'number') {
      await PropertyCardRenderer.render(propertyOrId, this.session)

      return
    }

    if (!propertyToRender) return

    PropertyInsightsRenderer.renderWithData(propertyToRender, this.session)
    await PropertyCardRenderer.renderWithData(propertyToRender, this.session)
  }
}
