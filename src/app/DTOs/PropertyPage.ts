type PropertyPageAttributes = {
  id: number
  name: string
  overallRating: number | null
  from: Date
  to: Date
}

export class PropertyPage {
  private id!: number
  private name!: string
  private overallRating!: number | null
  private from!: Date
  private to!: Date

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

  public getFrom (): Date {
    return this.from
  }

  public getTo (): Date {
    return this.to
  }
}
