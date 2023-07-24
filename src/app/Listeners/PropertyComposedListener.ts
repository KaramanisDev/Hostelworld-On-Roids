import type { Property } from 'DTOs/Property'
import { AbstractListener } from 'Listeners/AbstractListener'
import { Subscribe } from 'Core/EventBus'
import { HostelworldDataManipulator } from 'Services/HostelworldDataManipulator'

@Subscribe('property:composed')
export class PropertyComposedListener extends AbstractListener {
  public async handle (property: Property): Promise<void> {
    this.persistPropertyInSession(property)

    await HostelworldDataManipulator.setPropertyBookingsOnSearch(
      property.getId(), property.getBookedCountries()
    )

    this.emit('property:render', property)
  }
}
