import type { Property } from 'DTOs/Property'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from 'Listeners/AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'

@Subscribe('property:render')
export class PropertyRenderListener extends AbstractListener {
  public async handle (propertyOrId: Property | number): Promise<void> {
    const propertyToRender: Property | undefined = typeof propertyOrId === 'number'
      ? this.propertyInSession(propertyOrId)
      : propertyOrId

    if (!propertyToRender && typeof propertyOrId === 'number') {
      await PropertyCardRenderer.render(propertyOrId)

      return
    }

    if (!propertyToRender) return

    await PropertyCardRenderer.renderWithData(propertyToRender)
  }
}
