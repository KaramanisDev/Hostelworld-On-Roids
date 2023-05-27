type FreeCancellation = {
  label: string
  description: string
}

type LowestAverageDormPricePerNight = {
  value: string
  currency: string
}

type Promotion = {
  id: number
  type: string
  stack: boolean
  name: string
  discount: number
}

type AveragePricePerNight = {
  ratePlan: number
  price: LowestAverageDormPricePerNight
  originalPrice: LowestAverageDormPricePerNight
}

type BasicType = 'Mixed Dorm' | 'Female Dorm' | 'Private' | 'Dbl Private'

type Grade = 'Standard' | 'Superior' | 'Basic' | ''

type Image = {
  prefix: string
  suffix: string
}

type PriceBreakdown = {
  ratePlan: number
  date: Date
  price: LowestAverageDormPricePerNight
}

type ID = 'depositPayable' | 'nonRefundable'

type Label = 'Deposit only' | 'Non-refundable'

type RatePlanType = 'STANDARD' | 'BED_AND_BREAKFAST'

type PaymentProcedure = {
  id: ID
  label: Label
  description: string
}

type Promotions = {
  promotionsIds: number[]
  totalDiscount: string
}

type RatePlan = {
  id: number
  paymentProcedure: PaymentProcedure
  isDefault: boolean
  fenceDiscount: number
  ratePlanType: RatePlanType
  promotions?: Promotions
}

type Dorm = {
  id: number
  token: string
  name: string
  description: string
  labelDescription: string
  capacity: string
  ensuite: string
  basicType: BasicType
  extendedType: string
  grade: Grade
  bathroomFacilities: never[]
  mealPlan: string
  view: string
  bedTypes: never[]
  facilities: never[]
  images: Image[]
  totalBedsAvailable: number
  totalRoomsAvailable: number | null
  numberOfGuestsPerRoom: number | null
  ratePlans: RatePlan[]
  averagePricePerNight: AveragePricePerNight[]
  lowestPricePerNight: LowestAverageDormPricePerNight
  stp: LowestAverageDormPricePerNight | null
  conditions: never[]
  totalPrice: AveragePricePerNight[]
  priceBreakdown: PriceBreakdown[]
}

type Rooms = {
  dorms: Dorm[]
  privates: Dorm[]
}

export type HostelworldPropertyAvailability = {
  id: string
  cancellationPolicies: FreeCancellation[]
  depositPercentage: number
  rooms: Rooms
  specialEventConditions: null
  freeCancellation: FreeCancellation
  lowestPricePerNight: LowestAverageDormPricePerNight
  lowestPrivatePricePerNight: LowestAverageDormPricePerNight
  lowestDormPricePerNight: LowestAverageDormPricePerNight
  lowestAveragePricePerNight: LowestAverageDormPricePerNight
  lowestAverageDormPricePerNight: LowestAverageDormPricePerNight
  lowestAveragePrivatePricePerNight: LowestAverageDormPricePerNight
  freeCancellationAvailable: boolean
  freeCancellationAvailableUntil: Date
  promotions: Promotion[]
  stayRuleViolations: never[]
}
