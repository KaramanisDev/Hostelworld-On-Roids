import type { Search } from 'DTOs/Search'
import type { Property as SearchProperty } from 'Types/HostelworldSearchProperties'
import { Property } from 'DTOs/Property'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { AvailabilityAnalyzer } from 'Services/AvailabilityAnalyzer'
import type { AvailabilityMetrics as AvailabilityMetricsRawRaw } from 'Services/AvailabilityAnalyzer'
import type { ReviewMetrics as ReviewMetricsRaw } from 'Services/ReviewAnalyzer'
import { ReviewMetrics } from 'DTOs/ReviewMetrics'
import { ReviewAnalyzer } from 'Services/ReviewAnalyzer'

export class PropertyFactory {
  public static async create (searchProperty: SearchProperty, search: Search): Promise<Property> {
    const { id, name } = searchProperty

    const [availabilityMetricsRaw, reviewMetricsRaw]: [AvailabilityMetricsRawRaw, ReviewMetricsRaw] = await Promise.all([
      AvailabilityAnalyzer.analyze(String(id), search.getFrom(), search.getTo()),
      ReviewAnalyzer.analyze(String(id))
    ])

    const reviewMetrics: ReviewMetrics = new ReviewMetrics(reviewMetricsRaw)
    const availabilityMetrics: AvailabilityMetrics = new AvailabilityMetrics(availabilityMetricsRaw)

    return new Property({
      name,
      id: String(id),
      reviewMetrics,
      availabilityMetrics
    })
  }
}
