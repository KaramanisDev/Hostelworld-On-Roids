import type { HostelworldPropertyReviews, Review } from 'Types/HostelworldPropertyReviews'
import { delay, promiseFallback, randomNumber } from 'Utils'
import { HttpClient } from 'Utils/HttpClient'

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

  private static readonly ageBrackets: string[] = ['18-24', '25-30', '31-40', '41+']
  private static readonly recentMonthsWindow: number = 12
  private static readonly recentReviewsLimit: number = 25

  public static async fetch (propertyId: number, overallRating: number | null): Promise<PropertyReviews> {
    const { reviews, reviewStatistics, pagination } = await this.request(propertyId, 1)
    const remainingReviews: Review[] = await this.fetchRemainingPages(propertyId, pagination.numberOfPages)
    const allReviews: Review[] = [...reviews, ...remainingReviews]

    const metrics: PropertyReviews = this.emptyMetrics(overallRating)
    metrics.total = pagination.totalNumberOfItems
    metrics.solo = Math.round(metrics.total * ((reviewStatistics?.soloPercentage ?? 0) / 100))

    this.collectDemographics(allReviews, metrics)
    this.collectRecentRating(allReviews, metrics)

    return metrics
  }

  private static emptyMetrics (overallRating: number | null): PropertyReviews {
    return {
      male: 0,
      female: 0,
      other: 0,
      solo: 0,
      total: 0,
      ages: Object.fromEntries(this.ageBrackets.map(bracket => [bracket, 0])),
      recentOverallRating: null,
      recentReviewCount: 0,
      overallRating
    }
  }

  private static async fetchRemainingPages (propertyId: number, totalPages: number): Promise<Review[]> {
    const remainingPages: number = totalPages - 1

    const pages: Review[][] = await Promise.all(
      Array
        .from({ length: remainingPages }, (_, index) => index + 2)
        .map(async page => {
          await delay(randomNumber(1, 5) * 100)
          const { reviews } = await this.request(propertyId, page)

          return reviews
        })
    )

    return pages.flat()
  }

  private static collectDemographics (reviews: Review[], metrics: PropertyReviews): void {
    for (const review of reviews) {
      metrics.male += Number(['MALE', 'ALLMALEGROUP'].includes(review.groupInformation.groupTypeCode))
      metrics.female += Number(['FEMALE', 'ALLFEMALEGROUP'].includes(review.groupInformation.groupTypeCode))
      metrics.other += Number(['COUPLE', 'MIXEDGROUP'].includes(review.groupInformation.groupTypeCode))

      const age: string = review.groupInformation.age
      metrics.ages[age] = (metrics.ages[age] ?? 0) + 1
    }
  }

  private static collectRecentRating (reviews: Review[], metrics: PropertyReviews): void {
    const cutoffDate: Date = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - this.recentMonthsWindow)
    const cutoffTimestamp: number = cutoffDate.getTime()
    let ratingSum: number = 0

    for (const review of reviews) {
      if (metrics.recentReviewCount >= this.recentReviewsLimit) break

      const reviewTimestamp: number = new Date(review.date).getTime()
      if (reviewTimestamp < cutoffTimestamp) break

      ratingSum += review.rating.overall
      metrics.recentReviewCount++
    }

    if (metrics.recentReviewCount > 0) {
      metrics.recentOverallRating = Number((ratingSum / metrics.recentReviewCount / 10).toFixed(1))
    }
  }

  private static async request (propertyId: number, page: number): Promise<HostelworldPropertyReviews> {
    const endpoint: string = this.endpoint
      .replaceAll('{page}', String(page))
      .replaceAll('{property}', String(propertyId))

    const cacheTimeInDays: number = [1, 2].includes(page) ? 1 : 3

    return await promiseFallback(
      HttpClient.getJson(endpoint, { cacheInMinutes: cacheTimeInDays * 24 * 60 }),
      this.requestFallback()
    )
  }

  private static requestFallback (): HostelworldPropertyReviews {
    return {
      reviews: [],
      pagination: { totalNumberOfItems: 0, numberOfPages: 1, next: '' },
      reviewStatistics: {
        positiveCount: 0,
        negativeCount: 0,
        soloPercentage: 0,
        groupsPercentage: 0,
        couplesPercentage: 0
      }
    }
  }
}
