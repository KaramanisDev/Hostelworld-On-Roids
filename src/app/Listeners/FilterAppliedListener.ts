import type { Property } from 'DTOs/Property'
import type { FilterCriteria } from 'Services/PropertyFilterService'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchResultsFilter } from 'Services/Hostelworld/Page'
import { PropertyFilterService } from 'Services/PropertyFilterService'

@Subscribe('filter:applied')
export class FilterAppliedListener extends AbstractListener {
  public handle (criteria: FilterCriteria): void {
    const hasNoCriteria: boolean = !Object.keys(criteria.badges).length && !Object.keys(criteria.ranges).length
    if (hasNoCriteria) {
      SearchResultsFilter.clear()
      return
    }

    SearchResultsFilter.filterBy(
      (propertyId: number): boolean => {
        const property: Property | undefined = this.propertyInSession(propertyId)
        if (!property) return true

        return PropertyFilterService.matchesCriteria(property, criteria)
      }
    )
  }
}
