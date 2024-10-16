import type { Property } from 'DTOs/Property'
import { AbstractListener } from 'Listeners/AbstractListener'
import { Subscribe } from 'Core/EventBus'

@Subscribe('property:composed')
export class PropertyComposedListener extends AbstractListener {
  public async handle (property: Property): Promise<void> {
    this.persistPropertyInSession(property)

    this.emit('property:render', property)
  }
}
