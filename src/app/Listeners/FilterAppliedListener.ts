import type { Property } from 'DTOs/Property'
import type { FilterCriteria } from 'UI/Renderers/FilterModal/ViewDTOs'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'
import { PropertyFilterService } from 'Services/PropertyFilterService'

@Subscribe('filter:applied')
export class FilterAppliedListener extends AbstractListener {
  public handle (criteria: FilterCriteria): void {
    const hasNoCriteria: boolean = !Object.keys(criteria.badges).length && !Object.keys(criteria.ranges).length
    if (hasNoCriteria) {
      SearchPropertyListComponentPatcher.removePropertyFilter()
      return
    }

    SearchPropertyListComponentPatcher.applyPropertyFilter(
      (propertyId: number): boolean => {
        const property: Property | undefined = this.propertyInSession(propertyId)
        if (!property) return true

        return PropertyFilterService.matchesCriteria(property, criteria)
      }
    )
  }
}
