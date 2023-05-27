import type { Property } from 'DTOs/Property'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from 'Listeners/AbstractListener'
import { SearchPropertyRenderer } from 'Ui/SearchPropertyRenderer'

@Subscribe('property:render')
export class PropertyRenderListener extends AbstractListener {
  public async handle (propertyOrId: Property | string): Promise<void> {
    const propertyToRender: Property | undefined = typeof propertyOrId === 'string'
      ? this.propertyInSession(propertyOrId)
      : propertyOrId

    if (!propertyToRender) return

    await SearchPropertyRenderer.render(propertyToRender)
  }
}
