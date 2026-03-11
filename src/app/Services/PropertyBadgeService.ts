import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'

export type BadgeColor = 'purple' | 'pink' | 'orange' | 'blue' | 'red' | 'teal'

export type BadgeId = 'greatForSolo' | 'femaleFriendly' | 'youngCrowd' | 'midAgeCrowd' | 'matureCrowd' | 'closedDown'

export type PropertyBadge = {
  id: BadgeId
  label: string
  color: BadgeColor
}

export type PropertyMetrics = {
  reviews: ReviewMetrics
  availability: AvailabilityMetrics
}

export type BadgeMetadata = {
  id: BadgeId
  label: string
  color: BadgeColor
}

export type BadgeDefinition = BadgeMetadata & {
  condition: (metrics: PropertyMetrics) => boolean
}

export class PropertyBadgeService {
  private static readonly badges: BadgeDefinition[] = [
    {
      id: 'greatForSolo',
      label: 'Great for Solo',
      color: 'purple',
      condition: (metrics: PropertyMetrics): boolean => metrics.reviews.getSoloPercentage() > 90
    },
    {
      id: 'femaleFriendly',
      label: 'Female Friendly',
      color: 'pink',
      condition: (metrics: PropertyMetrics): boolean => {
        const hasFemaleReviews: boolean = metrics.reviews.getFemalePercentage() > 60
        const hasFemaleBeds: boolean = metrics.availability.getMaxFemaleBeds() > 0

        return hasFemaleReviews && hasFemaleBeds
      }
    },
    {
      id: 'youngCrowd',
      label: 'Young Crowd',
      color: 'orange',
      condition: (metrics: PropertyMetrics): boolean => metrics.reviews.getAgePercentage('18-24') > 40
    },
    {
      id: 'midAgeCrowd',
      label: 'Mid-Age Crowd',
      color: 'teal',
      condition: (metrics: PropertyMetrics): boolean => metrics.reviews.getAgePercentage('18-24') < 30
    },
    {
      id: 'matureCrowd',
      label: 'Mature Crowd',
      color: 'blue',
      condition: (metrics: PropertyMetrics): boolean => {
        const percentage: number = metrics.reviews.getAgePercentage('31-40') + metrics.reviews.getAgePercentage('41+')

        return percentage > 40
      }
    },
    {
      id: 'closedDown',
      label: 'Closed Down',
      color: 'red',
      condition: (metrics: PropertyMetrics): boolean => !metrics.availability.getMaxGuests()
    }
  ]

  public static badgeMetadata (): BadgeMetadata[] {
    return this.badges.map(badge => ({
      id: badge.id,
      label: badge.label,
      color: badge.color
    }))
  }

  public static badgesFor (metrics: PropertyMetrics): PropertyBadge[] {
    const result: PropertyBadge[] = []

    for (const badge of this.badges) {
      if (!badge.condition(metrics)) continue

      result.push({ id: badge.id, label: badge.label, color: badge.color })
    }

    return result
  }
}
