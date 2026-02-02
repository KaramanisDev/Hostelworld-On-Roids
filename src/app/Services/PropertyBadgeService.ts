import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { Property } from 'DTOs/Property'

export type BadgeColor = 'purple' | 'pink' | 'orange' | 'blue' | 'red' | 'teal'

export type PropertyBadge = {
  label: string
  color: BadgeColor
}

type PropertyMetrics = {
  reviews: ReviewMetrics
  availability: AvailabilityMetrics
}

type BadgeDefinition = {
  label: string
  color: BadgeColor
  condition: (metrics: PropertyMetrics) => boolean
}

export class PropertyBadgeService {
  private static readonly badges: BadgeDefinition[] = [
    {
      label: 'Great for Solo',
      color: 'purple',
      condition: (metrics: PropertyMetrics): boolean => metrics.reviews.getSoloPercentage() > 90
    },
    {
      label: 'Female Friendly',
      color: 'pink',
      condition: (metrics: PropertyMetrics): boolean => {
        const hasFemaleReviews: boolean = metrics.reviews.getFemalePercentage() > 60
        const hasFemaleBeds: boolean = metrics.availability.getMaxFemaleBeds() > 0

        return hasFemaleReviews && hasFemaleBeds
      }
    },
    {
      label: 'Young Crowd',
      color: 'orange',
      condition: (metrics: PropertyMetrics): boolean => metrics.reviews.getAgePercentage('18-24') > 40
    },
    {
      label: 'Mid-Age Crowd',
      color: 'teal',
      condition: (metrics: PropertyMetrics): boolean => metrics.reviews.getAgePercentage('18-24') < 30
    },
    {
      label: 'Mature Crowd',
      color: 'blue',
      condition: (metrics: PropertyMetrics): boolean => {
        const percentage: number = metrics.reviews.getAgePercentage('31-40') + metrics.reviews.getAgePercentage('41+')

        return percentage > 40
      }
    },
    {
      label: 'Closed Down',
      color: 'red',
      condition: (metrics: PropertyMetrics): boolean => !metrics.availability.getMaxGuests()
    }
  ]

  public static calculateFor (property: Property): PropertyBadge[] {
    const reviews: ReviewMetrics = property.getReviewMetrics()
    const availability: AvailabilityMetrics = property.getAvailabilityMetrics()
    const metrics: PropertyMetrics = { reviews, availability }

    const result: PropertyBadge[] = []

    for (const badge of this.badges) {
      if (!badge.condition(metrics)) continue

      result.push({ label: badge.label, color: badge.color })
    }

    return result
  }
}
