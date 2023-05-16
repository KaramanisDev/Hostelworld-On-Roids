export type HostelWorldSearchResponse = {
  properties: Property[];
  location: Location;
  locationEn: Location;
  filterData: FilterData;
  sortOrder: null;
  pagination: Pagination;
}

export type FilterData = {
  highestPricePerNight: HighestPricePerNight;
  lowestPricePerNight: HighestPricePerNight;
}

export type HighestPricePerNight = {
  value: string;
  currency: Currency;
}

export type Currency = string;

export type Location = {
  city: City;
  region: Region;
}

export type City = {
  id: number;
  name: string;
  idCountry: number;
  country: string;
}

export type Region = {
  id: string;
  name: string;
}

export type Pagination = {
  next: string;
  prev: string;
  numberOfPages: number;
  totalNumberOfItems: number;
}

export type Property = {
  id: number;
  isPromoted: boolean;
  hbid: number;
  name: string;
  starRating: number;
  overallRating: OverallRating | null;
  ratingBreakdown: RatingBreakdown;
  latitude: number;
  longitude: number;
  isFeatured: boolean;
  type: PropertyType;
  address1: string;
  address2: string;
  freeCancellationAvailable: boolean;
  freeCancellationAvailableUntil: Date;
  district: Region | null;
  districts: District[];
  freeCancellation: FreeCancellation;
  lowestPricePerNight: HighestPricePerNight;
  lowestPrivatePricePerNight: HighestPricePerNight | null;
  lowestDormPricePerNight: HighestPricePerNight | null;
  lowestAveragePricePerNight: LowestAveragePricePerNight;
  lowestAverageDormPricePerNight: LowestAveragePricePerNight | null;
  lowestAveragePrivatePricePerNight: LowestAveragePricePerNight | null;
  isNew: boolean;
  overview: string;
  isElevate: boolean;
  hostelworldRecommends: boolean;
  distance: Distance;
  position: number;
  hwExtra: null;
  fabSort: { [key: string]: number };
  promotions: Promotion[];
  stayRuleViolations: any[];
  veryPopular?: boolean;
  rooms: Rooms;
  images: Image[];
  imagesGallery: Image[];
  facilities: Facility[];
}

export type Distance = {
  value: number;
  units: Units;
}

export type Units = 'km';

export type District = {
  id: number;
  name: string;
}

export type Facility = {
  name: Name;
  id: ID;
  facilities: Region[];
}

export type ID =
  'FACILITYCATEGORYFREE'
  | 'FACILITYCATEGORYGENERAL'
  | 'FACILITYCATEGORYSERVICES'
  | 'FACILITYCATEGORYFOODANDDRINK'
  | 'FACILITYCATEGORYENTERTAINMENT';

export type Name = 'Free' | 'General' | 'Services' | 'Food & Drink' | 'Entertainment';

export type FreeCancellation = {
  label: string;
  description: string;
}

export type Image = {
  prefix: string;
  suffix: string;
}

export type LowestAveragePricePerNight = {
  value: string;
  currency: Currency;
  promotions?: Promotions;
  original?: string;
}

export type Promotions = {
  promotionsIds: number[];
  totalDiscount: string;
}

export type OverallRating = {
  overall: number;
  numberOfRatings: string;
}

export type Promotion = {
  id: number;
  type: PromotionType;
  stack: boolean;
  name: string;
  discount: number;
}

export type PromotionType = 'LOS' | 'CUSTOM';

export type RatingBreakdown = {
  ratingsCount: number;
  security: number;
  location: number;
  staff: number;
  fun: number;
  clean: number;
  facilities: number;
  value: number;
  average: number;
}

export type Rooms = {
  privates: Dorm[];
  dorms: Dorm[];
}

export type Dorm = {
  id: number;
  token: string;
  name: string;
  capacity: string;
  basicType: BasicType;
  ensuite: boolean;
  grade: Grade;
  extendedType: ExtendedType;
  averagePrice: HighestPricePerNight;
  stp: null;
  conditions: any[];
}

export type BasicType = 'Mixed Dorm' | 'Female Dorm' | 'Male Dorm' | 'Dbl Private' | 'Private';

export type ExtendedType = '' | 'Apartment' | 'Family Room';

export type Grade = 'Deluxe' | 'Standard' | 'Superior' | '' | 'Basic';

export type PropertyType = 'HOSTEL' | 'GUESTHOUSE' | 'APARTMENT' | 'HOTEL';
