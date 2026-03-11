import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCompositionBuffer } from 'Services/PropertyCompositionBuffer'

@Subscribe('property:composition:reset')
export class PropertyCompositionResetListener extends AbstractListener {
  public handle (): void {
    PropertyCompositionBuffer.clear()
  }
}
