import type { Search } from 'DTOs/Search'
import type { Property as HostelworldProperty } from 'Types/HostelworldSearch'
import { Property } from 'DTOs/Property'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { ReviewsClient } from 'Services/Hostelworld/Api/ReviewsClient'
import { VisitorsCountryClient } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import { BookedCountry } from 'DTOs/BookedCountry'
import { AvailabilityClient } from 'Services/Hostelworld/Api/AvailabilityClient'

export class PropertyFactory {
  public static async create (property: HostelworldProperty, search: Search): Promise<Property> {
    const { id, name } = property

    const [reviews, availability, countries]: [PropertyReviews, PropertyAvailability, PropertyGuestsCountries] =
      await Promise.all([
        ReviewsClient.fetch(id),
        AvailabilityClient.fetch(id, search.getFrom(), search.getTo()),
        VisitorsCountryClient.fetch(id, search.getFrom(), search.getTo())
      ])

    const reviewMetrics: ReviewMetrics = new ReviewMetrics(reviews)
    const availabilityMetrics: AvailabilityMetrics = new AvailabilityMetrics(availability)
    const bookedCountries: BookedCountry[] = countries.map(
      country => new BookedCountry(country)
    )

    return new Property({
      id,
      name,
      reviewMetrics,
      bookedCountries,
      availabilityMetrics
    })
  }
}
