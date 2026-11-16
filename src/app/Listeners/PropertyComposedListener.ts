import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'

@Subscribe('property:composed')
export class PropertyComposedListener extends AbstractListener {
  public handle (): void {
    SearchPropertyListComponentPatcher.scheduleRefresh()
  }
}
