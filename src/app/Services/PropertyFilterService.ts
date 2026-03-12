import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { FilterCriteria } from 'UI/Renderers/FilterModal/ViewDTOs'
import type { BadgeId } from 'Services/PropertyBadgeService'

export class PropertyFilterService {
  public static matchesCriteria (property: Property, criteria: FilterCriteria): boolean {
    return this.matchesBadges(property, criteria) &&
      this.matchesRanges(property, criteria)
  }

  private static matchesBadges (property: Property, criteria: FilterCriteria): boolean {
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

  private static matchesRanges (property: Property, criteria: FilterCriteria): boolean {
    for (const [key, range] of Object.entries(criteria.ranges)) {
      const percentage: number | undefined = this.percentageForKey(property, key)
      if (percentage === undefined) continue

      if (percentage < range.min || percentage > range.max) return false
    }

    return true
  }

  private static percentageForKey (property: Property, key: string): number | undefined {
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
