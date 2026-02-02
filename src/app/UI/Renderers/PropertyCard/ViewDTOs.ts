import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'

export type MetricType = 'reviews' | 'availability'

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
}

export class PropertyCardLabels {
  public static readonly reviews: ReadonlyArray<string> = ['Male', 'Female', 'Other', 'Solo', 'Total']
  public static readonly availability: ReadonlyArray<string> = ['Mixed', 'Female', 'Private', 'Guests']

  public static forType (metricType: MetricType): ReadonlyArray<string> {
    return metricType === 'reviews' ? this.reviews : this.availability
  }

  public static titleForType (metricType: MetricType): string {
    return metricType === 'reviews' ? 'Reviews' : 'Availability'
  }
}

export class PropertyCardNotes {
  public static readonly loading: string = '⏳ Loading property data...'
  public static readonly processing: string = '🔄 Property data are being processed...'
  public static readonly finalized: string = 'ℹ️ Data displayed here can take up to an hour to be refreshed.'
}

export class PropertyCardViewDTOFactory {
  public static loading (propertyId: number): PropertyCardViewDTO {
    return {
      propertyId,
      reviews: undefined,
      availability: undefined
    }
  }

  public static loaded (property: Property): PropertyCardViewDTO {
    return {
      propertyId: property.getId(),
      reviews: this.reviewsRow(property.getReviewMetrics()),
      availability: this.availabilityRow(property.getAvailabilityMetrics())
    }
  }

  public static reviewsRow (metrics: ReviewMetrics): MetricRowViewDTO {
    return {
      title: 'Reviews',
      items: [
        { label: 'Male', value: `${metrics.getMale()} (${metrics.getMalePercentage()}%)` },
        { label: 'Female', value: `${metrics.getFemale()} (${metrics.getFemalePercentage()}%)` },
        { label: 'Other', value: `${metrics.getOther()} (${metrics.getOtherPercentage()}%)` },
        { label: 'Solo', value: `${metrics.getSolo()} (${metrics.getSoloPercentage()}%)` },
        { label: 'Total', value: String(metrics.getTotal()) }
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
}
