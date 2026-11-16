import type { HostelworldPropertyReviews, Review } from 'Types/HostelworldPropertyReviews'
import { mapWithConcurrency, promiseFallback } from 'Utils'
import { HttpClient } from 'Utils/HttpClient'
import { PropertyReviewsFactory } from 'Factories/PropertyReviewsFactory'

export type PropertyReviews = {
  male: number
  female: number
  other: number
  solo: number
  total: number
  ages: Record<string, number>
  recentOverallRating: number | null
  recentReviewCount: number
  overallRating: number | null
}

export class ReviewsClient {
  private static readonly endpoint: string = 'https://prod.apigee.hostelworld.com/legacy-hwapi-service/2.2/' +
    'properties/{property}/reviews/?page={page}&sort=newest&allLanguages=true&monthCount=72&per-page=50'

  private static readonly concurrentPageRequests: number = 6
  private static readonly networkJitterInMs: number = 500

  public static async fetch (propertyId: number, overallRating: number | null): Promise<PropertyReviews | null> {
    return await promiseFallback(this.reviewMetrics(propertyId, overallRating), null)
  }

  private static async reviewMetrics (propertyId: number, overallRating: number | null): Promise<PropertyReviews> {
    const firstPage: HostelworldPropertyReviews | null = await this.firstPage(propertyId)
    if (!firstPage) return PropertyReviewsFactory.empty(overallRating)

    const { reviews, reviewStatistics, pagination } = firstPage
    const remainingReviews: Review[] = await this.fetchRemainingPages(propertyId, pagination.numberOfPages)

    return PropertyReviewsFactory.create({
      reviews: [...reviews, ...remainingReviews],
      total: pagination.totalNumberOfItems,
      soloPercentage: reviewStatistics?.soloPercentage ?? 0,
      overallRating
    })
  }

  private static async firstPage (propertyId: number): Promise<HostelworldPropertyReviews | null> {
    try {
      return await this.request(propertyId, 1)
    } catch (error) {
      if (!HttpClient.isNotFound(error)) throw error

      return null
    }
  }

  private static async fetchRemainingPages (propertyId: number, totalPages: number): Promise<Review[]> {
    const remainingPages: number = totalPages - 1

    const pages: Review[][] = await mapWithConcurrency(
      Array.from({ length: remainingPages }, (_, index) => index + 2),
      this.concurrentPageRequests,
      async (page: number): Promise<Review[]> => {
        const { reviews } = await this.request(propertyId, page)

        return reviews
      }
    )

    return pages.flat()
  }

  private static async request (propertyId: number, page: number): Promise<HostelworldPropertyReviews> {
    const endpoint: string = this.endpoint
      .replaceAll('{page}', String(page))
      .replaceAll('{property}', String(propertyId))

    const cacheTimeInDays: number = [1, 2].includes(page) ? 1 : 3

    return await HttpClient.getJson(endpoint, {
      cacheInMinutes: cacheTimeInDays * 24 * 60,
      networkJitterInMs: this.networkJitterInMs
    })
  }
}
