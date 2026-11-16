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
  reviews: ReviewMetrics | null
  availability: AvailabilityMetrics | null
}

export type BadgeMetadata = {
  id: BadgeId
  label: string
  color: BadgeColor
}

type ReviewsBadgeDefinition = BadgeMetadata & {
  basis: 'reviews'
  condition: (reviews: ReviewMetrics) => boolean
}

type AvailabilityBadgeDefinition = BadgeMetadata & {
  basis: 'availability'
  condition: (availability: AvailabilityMetrics) => boolean
}

type CombinedBadgeDefinition = BadgeMetadata & {
  basis: 'combined'
  condition: (reviews: ReviewMetrics, availability: AvailabilityMetrics) => boolean
}

export type BadgeDefinition = ReviewsBadgeDefinition | AvailabilityBadgeDefinition | CombinedBadgeDefinition

export class PropertyBadgeService {
  private static readonly badges: BadgeDefinition[] = [
    {
      id: 'greatForSolo',
      label: 'Great for Solo',
      color: 'purple',
      basis: 'reviews',
      condition: (reviews: ReviewMetrics): boolean => reviews.getSoloPercentage() > 90
    },
    {
      id: 'femaleFriendly',
      label: 'Female Friendly',
      color: 'pink',
      basis: 'combined',
      condition: (reviews: ReviewMetrics, availability: AvailabilityMetrics): boolean => {
        const hasFemaleReviews: boolean = reviews.getFemalePercentage() > 60
        const hasFemaleBeds: boolean = availability.getMaxFemaleBeds() > 0

        return hasFemaleReviews && hasFemaleBeds
      }
    },
    {
      id: 'youngCrowd',
      label: 'Young Crowd',
      color: 'orange',
      basis: 'reviews',
      condition: (reviews: ReviewMetrics): boolean => reviews.getAgePercentage('18-24') > 40
    },
    {
      id: 'midAgeCrowd',
      label: 'Mid-Age Crowd',
      color: 'teal',
      basis: 'reviews',
      condition: (reviews: ReviewMetrics): boolean => reviews.getAgePercentage('18-24') < 30
    },
    {
      id: 'matureCrowd',
      label: 'Mature Crowd',
      color: 'blue',
      basis: 'reviews',
      condition: (reviews: ReviewMetrics): boolean => {
        const percentage: number = reviews.getAgePercentage('31-40') + reviews.getAgePercentage('41+')

        return percentage > 40
      }
    },
    {
      id: 'closedDown',
      label: 'Closed Down',
      color: 'red',
      basis: 'availability',
      condition: (availability: AvailabilityMetrics): boolean => !availability.getMaxGuests()
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
      if (!this.isEarned(badge, metrics)) continue

      result.push({ id: badge.id, label: badge.label, color: badge.color })
    }

    return result
  }

  private static isEarned (badge: BadgeDefinition, metrics: PropertyMetrics): boolean {
    const { reviews, availability }: PropertyMetrics = metrics

    switch (badge.basis) {
      case 'reviews': return reviews !== null && badge.condition(reviews)
      case 'availability': return availability !== null && badge.condition(availability)
      case 'combined': return reviews !== null && availability !== null && badge.condition(reviews, availability)
    }
  }
}
