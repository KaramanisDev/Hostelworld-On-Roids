export type HostelworldPropertyReviews = {
  reviews: Review[]
  reviewStatistics: ReviewStatistics | null
  pagination: Pagination
}

type ReviewStatistics = {
  positiveCount: number
  negativeCount: number
  soloPercentage: number
  couplesPercentage: number
  groupsPercentage: number
}

type Pagination = {
  prev: null
  next: string
  numberOfPages: number
  totalNumberOfItems: number
}

export type Review = {
  id: string
  date: Date
  notes: string
  isMachineTranslated: boolean
  languageCode: string
  ownerComment: null
  groupInformation: GroupInformation
  rating: Rating
  user: User
  liked: null
  disliked: null
  recommended: null
}

type GroupInformation = {
  groupTypeCode: GroupTypeCode
  age: Age
  tripTypeCodes: TripTypeCode[]
}

type Age = '18-24' | '25-30' | '31-40' | '41+'

type GroupTypeCode = 'FEMALE' | 'MALE' | 'COUPLE' | 'ALLMALEGROUP' | 'ALLFEMALEGROUP' | 'MIXEDGROUP'

type TripTypeCode = 'RTWTRIP' | 'GAPYEAR' | 'REGULARVACATION' | 'WEEKENDAWAY' | 'COLLEGEBREAK' | 'OTHER'

type Rating = {
  value: number
  safety: number
  location: number
  staff: number
  atmosphere: number
  cleanliness: number
  facilities: number
  overall: number
}

type User = {
  id: number
  gender: Gender | null
  nationality: Nationality
  image: Image | null
  nickname: string
  numberOfReviews: string
}

type Gender = {
  value: ID
  id: ID
}

type ID = 'Female' | 'Male'

type Image = {
  prefix: string
  suffix: string
}

type Nationality = {
  code: string
  name: string
}
