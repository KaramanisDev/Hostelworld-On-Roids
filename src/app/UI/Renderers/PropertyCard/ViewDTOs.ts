import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'

export type MetricType = 'reviews' | 'availability' | 'ageGroups' | 'recentRating'

export type TrendDirection = 'up' | 'down' | 'flat'

export type RecentRatingViewDTO = {
  values: string[]
  trendDirection: TrendDirection | null
}

export type MetricRowViewDTO = {
  values: string[]
}

export type PropertyCardViewDTO = {
  propertyId: number
  reviews?: MetricRowViewDTO | null
  availability?: MetricRowViewDTO | null
  ageGroups?: MetricRowViewDTO | null
  recentRating?: RecentRatingViewDTO | null
}

export type ReviewRowsViewDTO = Required<Pick<PropertyCardViewDTO, 'reviews' | 'ageGroups' | 'recentRating'>>

export class PropertyCardLabels {
  public static readonly reviews: ReadonlyArray<string> = ['Male', 'Female', 'Other', 'Solo']
  public static readonly availability: ReadonlyArray<string> = ['Mixed', 'Female', 'Private', 'Guests']
  public static readonly ageGroups: ReadonlyArray<string> = ['18-24', '25-30', '31-40', '41+']
  public static readonly recentRating: ReadonlyArray<string> = ['Score', 'Trend', 'Reviews', 'Period']
  public static readonly unavailable: string = 'Unavailable'

  public static forType (metricType: MetricType): ReadonlyArray<string> {
    switch (metricType) {
      case 'reviews': return this.reviews
      case 'availability': return this.availability
      case 'ageGroups': return this.ageGroups
      case 'recentRating': return this.recentRating
    }
  }

  public static titleForType (metricType: MetricType): string {
    switch (metricType) {
      case 'reviews': return 'Reviews'
      case 'availability': return 'Availability'
      case 'ageGroups': return 'Age Groups'
      case 'recentRating': return 'Recent Rating'
    }
  }
}

export class PropertyCardNotes {
  public static readonly loading: string = '🔄 Property data are being processed...'
  public static readonly finalized: string = 'ℹ️ Data displayed here can take up to an hour to be refreshed.'
  public static readonly disconnected: string = '⚠️ H.O.R was updated. Reload the page to load the property data.'
}

export class PropertyCardViewDTOFactory {
  public static loading (propertyId: number): PropertyCardViewDTO {
    return {
      propertyId,
      reviews: undefined,
      availability: undefined,
      ageGroups: undefined,
      recentRating: undefined
    }
  }

  public static loaded (property: Property): PropertyCardViewDTO {
    return {
      propertyId: property.getId(),
      availability: this.availabilityRow(property.getAvailabilityMetrics()),
      ...this.reviewRows(property.getReviewMetrics())
    }
  }

  public static reviewRows (metrics: ReviewMetrics | null): ReviewRowsViewDTO {
    return {
      reviews: this.reviewsRow(metrics),
      ageGroups: this.ageGroupsRow(metrics),
      recentRating: this.recentRatingRow(metrics)
    }
  }

  public static availabilityRow (metrics: AvailabilityMetrics | null): MetricRowViewDTO {
    if (!metrics) return this.unavailableRow('availability')

    return {
      values: [
        `${metrics.getMixedBeds()}/${metrics.getMaxMixedBeds()} (${metrics.getMixedBedsPercentage()}%)`,
        `${metrics.getFemaleBeds()}/${metrics.getMaxFemaleBeds()} (${metrics.getFemaleBedsPercentage()}%)`,
        `${metrics.getPrivateRooms()}/${metrics.getMaxPrivateRooms()} (${metrics.getPrivateRoomsPercentage()}%)`,
        `${metrics.getGuests()}/${metrics.getMaxGuests()} (${metrics.getGuestsPercentage()}%)`
      ]
    }
  }

  private static reviewsRow (metrics: ReviewMetrics | null): MetricRowViewDTO {
    if (!metrics) return this.unavailableRow('reviews')

    return {
      values: [
        `${metrics.getMale()}/${metrics.getTotal()} (${metrics.getMalePercentage()}%)`,
        `${metrics.getFemale()}/${metrics.getTotal()} (${metrics.getFemalePercentage()}%)`,
        `${metrics.getOther()}/${metrics.getTotal()} (${metrics.getOtherPercentage()}%)`,
        `${metrics.getSolo()}/${metrics.getTotal()} (${metrics.getSoloPercentage()}%)`
      ]
    }
  }

  private static ageGroupsRow (metrics: ReviewMetrics | null): MetricRowViewDTO {
    if (!metrics) return this.unavailableRow('ageGroups')

    const ages: Record<string, number> = metrics.getAges()
    const total: number = metrics.getTotal()

    return {
      values: PropertyCardLabels.ageGroups.map(
        bracket => `${ages[bracket] ?? 0}/${total} (${metrics.getAgePercentage(bracket)}%)`
      )
    }
  }

  private static recentRatingRow (metrics: ReviewMetrics | null): RecentRatingViewDTO {
    if (!metrics) return { ...this.unavailableRow('recentRating'), trendDirection: null }

    const recent: number | null = metrics.getRecentOverallRating()
    const hasRating: boolean = recent !== null
    const trend: number | null = this.trendDifference(recent, metrics.getOverallRating())

    return {
      values: [
        hasRating ? String(recent) : 'N/A',
        this.trendLabel(trend),
        hasRating ? String(metrics.getRecentReviewCount()) : '0',
        '12 months'
      ],
      trendDirection: this.trendDirection(trend)
    }
  }

  private static unavailableRow (metricType: MetricType): MetricRowViewDTO {
    return {
      values: PropertyCardLabels.forType(metricType).map(() => PropertyCardLabels.unavailable)
    }
  }

  private static trendDifference (recent: number | null, allTime: number | null): number | null {
    if (recent === null || allTime === null) return null

    return Number((recent - allTime).toFixed(1))
  }

  private static trendLabel (difference: number | null): string {
    if (difference === null) return '—'
    if (difference > 0) return `+${difference}`
    if (difference < 0) return String(difference)

    return '0.0'
  }

  private static trendDirection (difference: number | null): TrendDirection | null {
    if (difference === null) return null
    if (difference > 0) return 'up'
    if (difference < 0) return 'down'

    return 'flat'
  }
}
