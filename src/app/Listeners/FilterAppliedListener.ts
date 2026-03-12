import type { Property } from 'DTOs/Property'
import type { FilterCriteria } from 'UI/Renderers/FilterModal/ViewDTOs'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'
import { PropertyFilterService } from 'Services/PropertyFilterService'

@Subscribe('filter:applied property:composed')
export class FilterAppliedListener extends AbstractListener {
  public handle (...args: unknown[]): void {
    const criteria: FilterCriteria | undefined = this.parsedFilterCriteria(args)

    if (!criteria) {
      void SearchPropertyListComponentPatcher.refreshProperties()
      return
    }

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

  private parsedFilterCriteria (args: unknown[]): FilterCriteria | undefined {
    const candidate: unknown = args[0]
    if (!candidate || typeof candidate !== 'object') return
    if (!('badges' in candidate) || !('ranges' in candidate)) return

    return candidate as FilterCriteria
  }
}
