import { FilterModalView } from 'UI/SolidJS/FilterModal/FilterModalView'
import type { FilterModalViewDTO } from './ViewDTOs'
import type { FilterCriteria } from 'Services/PropertyFilterService'
import { FilterModalViewDTOFactory } from './ViewDTOs'
import { SearchToolbarArea } from 'Services/Hostelworld/Page'
import { EventBus } from 'Core/EventBus'

export class FilterModalRenderer {
  private static readonly slotClassName: string = 'hor-filter-modal-wrapper'

  private static appliedCriteria: FilterCriteria = { badges: {}, ranges: {} }
  private static readonly view: FilterModalView = new FilterModalView()

  public static async render (): Promise<void> {
    this.view.onFilter(this.applyFilter.bind(this))

    await SearchToolbarArea.keepFilterSlot(this.slotClassName, this.mountView.bind(this))
  }

  private static applyFilter (criteria: FilterCriteria): void {
    this.appliedCriteria = criteria

    EventBus.emit('filter:applied', criteria)
  }

  private static mountView (slot: HTMLElement): void {
    const viewDto: FilterModalViewDTO = FilterModalViewDTOFactory.create(this.appliedCriteria)
    this.view.mount(slot, viewDto)
  }
}
