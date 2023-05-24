export type HostelworldSearchUnavailableProperties = {
  properties: Property[]
  pagination: Pagination
}

export type Property = {
  id: number
  name: string
  type: Type
  rating: string
  image: Image
}

 type Pagination = {
  next: string
  prev: string
  numberOfPages: number
  totalNumberOfItems: number
}

type Image = {
  prefix: string
  suffix: '.jpg'
}

type Type = 'Hostel' | 'Bed and Breakfast' | 'Apartment'
