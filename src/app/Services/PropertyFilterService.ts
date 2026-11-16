import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { PropertyBadgeService, type BadgeId, type BadgeMetadata } from 'Services/PropertyBadgeService'

export type FilterCriteria = {
  badges: Partial<Record<BadgeId, boolean>>
  ranges: Record<string, { min: number; max: number }>
}

export type RangeSection = 'demographics' | 'ageGroups'

export type RangeKey = 'male' | 'female' | 'solo' | 'age18to24' | 'age25to30' | 'age31to40' | 'age41plus'

export type RangeDimension = {
  key: RangeKey
  section: RangeSection
  percentage: (reviews: ReviewMetrics) => number
}

export class PropertyFilterService {
  private static readonly unfilterableBadges: BadgeId[] = ['closedDown']

  private static readonly rangeDimensions: RangeDimension[] = [
    {
      key: 'male',
      section: 'demographics',
      percentage: (reviews: ReviewMetrics): number => reviews.getMalePercentage()
    },
    {
      key: 'female',
      section: 'demographics',
      percentage: (reviews: ReviewMetrics): number => reviews.getFemalePercentage()
    },
    {
      key: 'solo',
      section: 'demographics',
      percentage: (reviews: ReviewMetrics): number => reviews.getSoloPercentage()
    },
    {
      key: 'age18to24',
      section: 'ageGroups',
      percentage: (reviews: ReviewMetrics): number => reviews.getAgePercentage('18-24')
    },
    {
      key: 'age25to30',
      section: 'ageGroups',
      percentage: (reviews: ReviewMetrics): number => reviews.getAgePercentage('25-30')
    },
    {
      key: 'age31to40',
      section: 'ageGroups',
      percentage: (reviews: ReviewMetrics): number => reviews.getAgePercentage('31-40')
    },
    {
      key: 'age41plus',
      section: 'ageGroups',
      percentage: (reviews: ReviewMetrics): number => reviews.getAgePercentage('41+')
    }
  ]

  public static filterableBadges (): BadgeMetadata[] {
    return PropertyBadgeService.badgeMetadata().filter(badge => !this.unfilterableBadges.includes(badge.id))
  }

  public static rangeDimensionsIn (section: RangeSection): RangeDimension[] {
    return this.rangeDimensions.filter(dimension => dimension.section === section)
  }

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
    const reviews: ReviewMetrics | null = property.getReviewMetrics()
    if (!reviews) return true

    for (const dimension of this.rangeDimensions) {
      const range: { min: number; max: number } | undefined = criteria.ranges[dimension.key]
      if (!range) continue

      const percentage: number = dimension.percentage(reviews)
      if (percentage < range.min || percentage > range.max) return false
    }

    return true
  }
}
