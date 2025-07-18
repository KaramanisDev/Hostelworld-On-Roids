import type { Property } from 'DTOs/Property'
import { AbstractListener } from './AbstractListener'
import { Subscribe } from 'Core/EventBus'

@Subscribe('worker:result:compose:property')
export class PropertyComposedListener extends AbstractListener {
  public async handle (property: Property): Promise<void> {
    this.persistPropertyInSession(property)

    this.emit('property:render', property)
  }
}
