import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { FilterCriteria } from 'UI/Renderers/FilterModal/ViewDTOs'
import type { BadgeId } from 'Services/PropertyBadgeService'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'

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
      (propertyId: number): boolean => this.propertyMatchesCriteria(propertyId, criteria)
    )
  }

  private propertyMatchesCriteria (propertyId: number, criteria: FilterCriteria): boolean {
    const property: Property | undefined = this.propertyInSession(propertyId)
    if (!property) return true

    return this.propertyMatchesBadges(property, criteria) &&
      this.propertyMatchesRanges(property, criteria)
  }

  private propertyMatchesBadges (property: Property, criteria: FilterCriteria): boolean {
    const badgeKeys: BadgeId[] = Object.keys(criteria.badges) as BadgeId[]
    const enabledBadges: BadgeId[] = badgeKeys.filter(
      key => criteria.badges[key]
    )

    if (!enabledBadges.length) return true

    const propertyBadgeIds: BadgeId[] = property.getBadges().map(badge => badge.id)

    for (const badgeKey of enabledBadges) {
      if (!propertyBadgeIds.includes(badgeKey)) return false
    }

    return true
  }

  private propertyMatchesRanges (property: Property, criteria: FilterCriteria): boolean {
    for (const [key, range] of Object.entries(criteria.ranges)) {
      const percentage: number | undefined = this.propertyPercentageForKey(property, key)
      if (percentage === undefined) continue

      if (percentage < range.min || percentage > range.max) return false
    }

    return true
  }

  private parsedFilterCriteria (args: unknown[]): FilterCriteria | undefined {
    const candidate: unknown = args[0]
    if (!candidate || typeof candidate !== 'object') return
    if (!('badges' in candidate) || !('ranges' in candidate)) return

    return candidate as FilterCriteria
  }

  private propertyPercentageForKey (property: Property, key: string): number | undefined {
    const reviews: ReviewMetrics = property.getReviewMetrics()

    const percentageMap: Record<string, () => number> = {
      male: () => reviews.getMalePercentage(),
      female: () => reviews.getFemalePercentage(),
      solo: () => reviews.getSoloPercentage(),
      age18to24: () => reviews.getAgePercentage('18-24'),
      age25to30: () => reviews.getAgePercentage('25-30'),
      age31to40: () => reviews.getAgePercentage('31-40'),
      age41plus: () => reviews.getAgePercentage('41+')
    }

    const getter: (() => number) | undefined = percentageMap[key]

    return getter ? getter() : undefined
  }
}
