import type { BookedCountryStat } from 'Services/BookedCountriesStatsProvider'

export class BookedCountry {
  private code!: string
  private name!: string
  private count!: number

  constructor (attributes: BookedCountryStat) {
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
