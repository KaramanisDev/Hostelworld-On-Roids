export type BedCounts = {
  mixed: number
  female: number
  private: number
  total: number
}

export type PropertyAvailability = {
  max: BedCounts
  current: BedCounts
}
