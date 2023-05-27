type Type = 'Hostel' | 'Bed and Breakfast' | 'Apartment'

type Image = {
  prefix: string
  suffix: '.jpg'
}

type Pagination = {
  next: string
  prev: string
  numberOfPages: number
  totalNumberOfItems: number
}

export type Property = {
  id: number
  name: string
  type: Type
  rating: string
  image: Image
}

export type HostelworldSearchUnavailableProperties = {
  properties: Property[]
  pagination: Pagination
}
