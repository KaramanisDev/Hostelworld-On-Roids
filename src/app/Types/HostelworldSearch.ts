type Currency = string

type City = {
  id: number
  name: string
  idCountry: number
  country: string
}

type Region = {
  id: string
  name: string
}

type Location = {
  city: City
  region: Region
}

type Pagination = {
  next: string
  prev: string
  numberOfPages: number
  totalNumberOfItems: number
}

export type Units = 'km'

type Distance = {
  value: number
  units: Units
}

type District = {
  id: number
  name: string
}

type ID =
  'FACILITYCATEGORYFREE'
  | 'FACILITYCATEGORYGENERAL'
  | 'FACILITYCATEGORYSERVICES'
  | 'FACILITYCATEGORYFOODANDDRINK'
  | 'FACILITYCATEGORYENTERTAINMENT'

type Name = 'Free' | 'General' | 'Services' | 'Food & Drink' | 'Entertainment'

type Facility = {
  name: Name
  id: ID
  facilities: Region[]
}

type FreeCancellation = {
  label: string
  description: string
}

type Image = {
  prefix: string
  suffix: string
}

type Promotions = {
  promotionsIds: number[]
  totalDiscount: string
}

type OverallRating = {
  overall: number
  numberOfRatings: string
}

type PromotionType = 'LOS' | 'CUSTOM'

type PromotionCampaign = {
  id: string
  name: string
  start: string
  end: string
}

type Promotion = {
  id: number
  type: PromotionType
  stack: boolean
  name: string
  discount: number
  campaign?: PromotionCampaign
}

type HighestPricePerNight = {
  value: string
  currency: Currency
}

type LowestAveragePricePerNight = {
  value: string
  currency: Currency
  promotions?: Promotions
  original?: string
}

type FilterData = {
  highestPricePerNight: HighestPricePerNight
  lowestPricePerNight: HighestPricePerNight
}

type RatingBreakdown = {
  ratingsCount: number
  security: number
  location: number
  staff: number
  fun: number
  clean: number
  facilities: number
  value: number
  average: number
}

type BasicType = 'Mixed Dorm' | 'Female Dorm' | 'Male Dorm' | 'Dbl Private' | 'Private'

type ExtendedType = '' | 'Apartment' | 'Family Room'

type Grade = 'Deluxe' | 'Standard' | 'Superior' | '' | 'Basic'

type PropertyType = 'HOSTEL' | 'GUESTHOUSE' | 'APARTMENT' | 'HOTEL'

type Dorm = {
  id: number
  token: string
  name: string
  capacity: string
  basicType: BasicType
  ensuite: boolean
  grade: Grade
  extendedType: ExtendedType
  averagePrice: HighestPricePerNight
  stp: null
  conditions: never[]
}

type Rooms = {
  privates: Dorm[]
  dorms: Dorm[]
}

export type Property = {
  id: number
  isPromoted: boolean
  hbid: number
  name: string
  starRating: number
  overallRating: OverallRating | null
  ratingBreakdown: RatingBreakdown
  latitude: number
  longitude: number
  isFeatured: boolean
  type: PropertyType
  address1: string
  address2: string
  freeCancellationAvailable: boolean
  freeCancellationAvailableUntil: Date
  district: Region | null
  districts: District[]
  freeCancellation: FreeCancellation
  lowestPricePerNight: HighestPricePerNight
  lowestPrivatePricePerNight: HighestPricePerNight | null
  lowestDormPricePerNight: HighestPricePerNight | null
  lowestAveragePricePerNight: LowestAveragePricePerNight
  lowestAverageDormPricePerNight: LowestAveragePricePerNight | null
  lowestAveragePrivatePricePerNight: LowestAveragePricePerNight | null
  isNew: boolean
  overview: string
  isElevate: boolean
  hostelworldRecommends: boolean
  distance: Distance
  position: number
  hwExtra: null
  fabSort: { [key: string]: number }
  promotions: Promotion[]
  stayRuleViolations: never[]
  veryPopular?: boolean
  rooms: Rooms
  images: Image[]
  imagesGallery: Image[]
  facilities: Facility[]
}

export type HostelworldSearch = {
  properties: Property[]
  location: Location
  locationEn: Location
  filterData: FilterData
  sortOrder: null
  pagination: Pagination
}
