import type { GuestCountry } from 'Services/Hostelworld/Api/VisitorsCountryClient'

export class BookedCountry {
  private code!: string
  private name!: string
  private count!: number

  constructor (attributes: GuestCountry) {
    Object.assign(this, attributes)
  }

  public getCode (): string {
    return this.code
  }

  public getName (): string {
    return this.name
  }

  public getCount (): number {
    return this.count
  }
}
