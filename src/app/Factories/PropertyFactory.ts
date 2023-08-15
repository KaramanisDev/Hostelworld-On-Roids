import type { Search } from 'DTOs/Search'
import type { Property as SearchProperty } from 'Types/HostelworldSearch'
import { Property } from 'DTOs/Property'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { AvailabilityAnalyzer } from 'Services/AvailabilityAnalyzer'
import type { AvailabilityMetrics as AvailabilityMetricsRawRaw } from 'Services/AvailabilityAnalyzer'
import type { ReviewMetrics as ReviewMetricsRaw } from 'Services/ReviewAnalyzer'
import type { BookedCountryStats } from 'Services/BookedCountriesStatsProvider'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { ReviewAnalyzer } from 'Services/ReviewAnalyzer'
import { BookedCountriesStatsProvider } from 'Services/BookedCountriesStatsProvider'
import { BookedCountry } from 'DTOs/BookedCountry'

export class PropertyFactory {
  public static async create (searchProperty: SearchProperty, search: Search): Promise<Property> {
    const { id, name } = searchProperty

    const [reviewMetricsRaw, availabilityMetricsRaw, bookedCountriesStats]: [ReviewMetricsRaw, AvailabilityMetricsRawRaw, BookedCountryStats] = await Promise.all([
      ReviewAnalyzer.analyze(String(id)),
      AvailabilityAnalyzer.analyze(String(id), search.getFrom(), search.getTo()),
      BookedCountriesStatsProvider.fetch(String(id), search.getFrom(), search.getTo())
    ])

    const reviewMetrics: ReviewMetrics = new ReviewMetrics(reviewMetricsRaw)
    const availabilityMetrics: AvailabilityMetrics = new AvailabilityMetrics(availabilityMetricsRaw)
    const bookedCountries: BookedCountry[] = bookedCountriesStats.map(stat => new BookedCountry(stat))

    return new Property({
      name,
      id: String(id),
      reviewMetrics,
      bookedCountries,
      availabilityMetrics
    })
  }
}
