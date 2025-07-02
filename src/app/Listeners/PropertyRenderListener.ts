import type { Property } from 'DTOs/Property'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from 'Listeners/AbstractListener'
import { PropertyCardRenderer } from 'Services/PropertyCardRenderer'

@Subscribe('property:render')
export class PropertyRenderListener extends AbstractListener {
  public async handle (propertyOrId: Property | string): Promise<void> {
    const propertyToRender: Property | undefined = typeof propertyOrId === 'string'
      ? this.propertyInSession(propertyOrId)
      : propertyOrId

    if (!propertyToRender && typeof propertyOrId === 'string') {
      await PropertyCardRenderer.renderProcessingMessage(propertyOrId)
      return
    }

    if (!propertyToRender) return

    await PropertyCardRenderer.render(propertyToRender)
  }
}
