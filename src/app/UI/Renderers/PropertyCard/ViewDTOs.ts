import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'

export type MetricType = 'reviews' | 'availability' | 'ageGroups'

export type MetricValueViewDTO = {
  label: string
  value: string
}

export type MetricRowViewDTO = {
  title: string
  items: MetricValueViewDTO[]
}

export type PropertyCardViewDTO = {
  propertyId: number
  reviews?: MetricRowViewDTO | null
  availability?: MetricRowViewDTO | null
  ageGroups?: MetricRowViewDTO | null
}

export class PropertyCardLabels {
  public static readonly reviews: ReadonlyArray<string> = ['Male', 'Female', 'Other', 'Solo']
  public static readonly availability: ReadonlyArray<string> = ['Mixed', 'Female', 'Private', 'Guests']
  public static readonly ageGroups: ReadonlyArray<string> = ['18-24', '25-30', '31-40', '41+']

  public static forType (metricType: MetricType): ReadonlyArray<string> {
    switch (metricType) {
      case 'reviews': return this.reviews
      case 'availability': return this.availability
      case 'ageGroups': return this.ageGroups
    }
  }

  public static titleForType (metricType: MetricType): string {
    switch (metricType) {
      case 'reviews': return 'Reviews'
      case 'availability': return 'Availability'
      case 'ageGroups': return 'Age Groups'
    }
  }
}

export class PropertyCardNotes {
  public static readonly loading: string = '🔄 Property data are being processed...'
  public static readonly finalized: string = 'ℹ️ Data displayed here can take up to an hour to be refreshed.'
}

export class PropertyCardViewDTOFactory {
  public static loading (propertyId: number): PropertyCardViewDTO {
    return {
      propertyId,
      reviews: undefined,
      availability: undefined,
      ageGroups: undefined
    }
  }

  public static loaded (property: Property): PropertyCardViewDTO {
    return {
      propertyId: property.getId(),
      reviews: this.reviewsRow(property.getReviewMetrics()),
      availability: this.availabilityRow(property.getAvailabilityMetrics()),
      ageGroups: this.ageGroupsRow(property.getReviewMetrics())
    }
  }

  public static reviewsRow (metrics: ReviewMetrics): MetricRowViewDTO {
    return {
      title: 'Reviews',
      items: [
        { label: 'Male', value: `${metrics.getMale()}/${metrics.getTotal()} (${metrics.getMalePercentage()}%)` },
        { label: 'Female', value: `${metrics.getFemale()}/${metrics.getTotal()} (${metrics.getFemalePercentage()}%)` },
        { label: 'Other', value: `${metrics.getOther()}/${metrics.getTotal()} (${metrics.getOtherPercentage()}%)` },
        { label: 'Solo', value: `${metrics.getSolo()}/${metrics.getTotal()} (${metrics.getSoloPercentage()}%)` },
      ]
    }
  }

  public static availabilityRow (metrics: AvailabilityMetrics): MetricRowViewDTO {
    return {
      title: 'Availability',
      items: [
        {
          label: 'Mixed',
          value: `${metrics.getMixedBeds()}/${metrics.getMaxMixedBeds()} (${metrics.getMixedBedsPercentage()}%)`
        },
        {
          label: 'Female',
          value: `${metrics.getFemaleBeds()}/${metrics.getMaxFemaleBeds()} (${metrics.getFemaleBedsPercentage()}%)`
        },
        {
          label: 'Private',
          value:
            `${metrics.getPrivateRooms()}/${metrics.getMaxPrivateRooms()} (${metrics.getPrivateRoomsPercentage()}%)`
        },
        {
          label: 'Guests',
          value: `${metrics.getGuests()}/${metrics.getMaxGuests()} (${metrics.getGuestsPercentage()}%)`
        }
      ]
    }
  }

  public static ageGroupsRow (metrics: ReviewMetrics): MetricRowViewDTO {
    const ages: Record<string, number> = metrics.getAges()
    const total: number = metrics.getTotal()

    return {
      title: 'Age Groups',
      items: PropertyCardLabels.ageGroups.map(bracket => ({
        label: bracket,
        value: `${ages[bracket] ?? 0}/${total} (${metrics.getAgePercentage(bracket)}%)`
      }))
    }
  }
}
