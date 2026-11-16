import type { Stay } from 'DTOs/Stay'

type PropertyPageAttributes = {
  id: number
  name: string
  overallRating: number | null
  stay: Stay
}

export class PropertyPage {
  private id!: number
  private name!: string
  private overallRating!: number | null
  private stay!: Stay

  constructor (attributes: PropertyPageAttributes) {
    Object.assign(this, attributes)
  }

  public getId (): number {
    return this.id
  }

  public getName (): string {
    return this.name
  }

  public getOverallRating (): number | null {
    return this.overallRating
  }

  public getStay (): Stay {
    return this.stay
  }
}
