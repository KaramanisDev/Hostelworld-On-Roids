export type PropertyReviews = {
  male: number
  female: number
  other: number
  solo: number
  total: number
  ages: Record<string, number>
  recentOverallRating: number | null
  recentReviewCount: number
}
