import type { GuestCountry } from 'Services/Hostelworld/Api/VisitorsCountryClient'

export class BookedCountry {
  private static readonly flagsUrl: string = 'https://a.hwstatic.com/hw/flags'

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

  public getFlag (): string {
    return `${BookedCountry.flagsUrl}/${this.getCode()}.svg`
  }

  public getGuestsLabel (): string {
    const guests: string = this.getCount() === 1 ? '1 person is' : `${this.getCount()} people are`

    return `${guests} coming from ${this.getName()}.`
  }
}
