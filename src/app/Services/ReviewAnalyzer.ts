import type { HostelworldPropertyReviews, Review } from 'Types/HostelworldPropertyReviews'
import { delay, promiseFallback, randomNumber } from 'Utils'
import { HttpClient } from 'Utils/HttpClient'

export type ReviewMetrics = {
  male: number
  female: number
  other: number
  solo: number
  total: number
}

export class ReviewAnalyzer {
  private static readonly endpoint: string = 'https://prod.apigee.hostelworld.com/legacy-hwapi-service/2.2/properties/{property}/reviews/?page={page}&sort=newest&allLanguages=true&monthCount=72&per-page=50'

  public static async analyze (property: string): Promise<ReviewMetrics> {
    const metrics: ReviewMetrics = { male: 0, female: 0, other: 0, solo: 0, total: 0 }

    const { reviews: firstPageReviews, reviewStatistics, pagination } = await this.request(property, 1)

    metrics.total = pagination.totalNumberOfItems
    metrics.solo = Math.round(metrics.total * ((reviewStatistics?.soloPercentage ?? 0) / 100))

    const leftOverPages: number = pagination.numberOfPages - 1
    // eslint-disable-next-line unicorn/prefer-spread
    const restOfPagesReviews: Review[] = Array.from(await Promise.all(
      Array
        .from({ length: leftOverPages }, (_, index) => index + 2)
        .map(async page => {
          await delay(randomNumber(3, 12) * 100)
          const { reviews } = await this.request(property, page)

          return reviews
        })
    )).flat()

    const reviews: Review[] = [...firstPageReviews, ...restOfPagesReviews]

    for (const review of reviews) {
      metrics.male += Number(['MALE', 'ALLMALEGROUP'].includes(review.groupInformation.groupTypeCode))
      metrics.female += Number(['FEMALE', 'ALLFEMALEGROUP'].includes(review.groupInformation.groupTypeCode))
      metrics.other += Number(['COUPLE', 'MIXEDGROUP'].includes(review.groupInformation.groupTypeCode))
    }

    return metrics
  }

  private static async request (property: string, page: number): Promise<HostelworldPropertyReviews> {
    const endpoint: string = this.endpoint
      .replaceAll('{page}', String(page))
      .replaceAll('{property}', property)

    const cacheTimeInDays: number = [1, 2].includes(page) ? 1 : 3

    return await promiseFallback(
      HttpClient.getJson(endpoint, cacheTimeInDays * 24 * 60),
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
