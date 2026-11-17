import type { Review } from 'Types/HostelworldPropertyReviews'
import type { PropertyReviews } from 'Services/Hostelworld/Api/ReviewsClient'

type ReviewsSummary = {
  reviews: Review[]
  total: number
  soloPercentage: number
}

export class PropertyReviewsFactory {
  private static readonly ageBrackets: string[] = ['18-24', '25-30', '31-40', '41+']
  private static readonly recentMonthsWindow: number = 12
  private static readonly recentReviewsLimit: number = 25

  public static create (summary: ReviewsSummary): PropertyReviews {
    const metrics: PropertyReviews = this.empty()
    metrics.total = summary.total
    metrics.solo = Math.round(metrics.total * (summary.soloPercentage / 100))

    this.collectDemographics(summary.reviews, metrics)
    this.collectRecentRating(summary.reviews, metrics)

    return metrics
  }

  public static empty (): PropertyReviews {
    return {
      male: 0,
      female: 0,
      other: 0,
      solo: 0,
      total: 0,
      ages: Object.fromEntries(this.ageBrackets.map(bracket => [bracket, 0])),
      recentOverallRating: null,
      recentReviewCount: 0
    }
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
}
