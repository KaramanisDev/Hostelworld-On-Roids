type Age = '18-24' | '25-30' | '31-40' | '41+'

type GroupTypeCode = 'FEMALE' | 'MALE' | 'COUPLE' | 'ALLMALEGROUP' | 'ALLFEMALEGROUP' | 'MIXEDGROUP'

type TripTypeCode = 'RTWTRIP' | 'GAPYEAR' | 'REGULARVACATION' | 'WEEKENDAWAY' | 'COLLEGEBREAK' | 'OTHER'

type ID = 'Female' | 'Male'

type Gender = {
  value: ID
  id: ID
}

type Image = {
  prefix: string
  suffix: string
}

type Nationality = {
  code: string
  name: string
}

type User = {
  id: number
  gender: Gender | null
  nationality: Nationality
  image: Image | null
  nickname: string
  numberOfReviews: string
}

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

type GroupInformation = {
  groupTypeCode: GroupTypeCode
  age: Age
  tripTypeCodes: TripTypeCode[]
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

export type HostelworldPropertyReviews = {
  reviews: Review[]
  reviewStatistics: ReviewStatistics | null
  pagination: Pagination
}
