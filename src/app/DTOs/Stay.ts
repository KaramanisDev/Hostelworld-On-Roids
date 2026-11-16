import { dateFormat } from 'Utils'

type StayAttributes = {
  from: Date
  to: Date
}

export class Stay {
  private static readonly oneDayInMs: number = 24 * 60 * 60 * 1000

  private from!: Date
  private to!: Date

  constructor (attributes: StayAttributes) {
    Object.assign(this, attributes)
  }

  public getFrom (): Date {
    return this.from
  }

  public getTo (): Date {
    return this.to
  }

  public getNights (): number {
    return Math.round(
      Math.abs(this.from.getTime() - this.to.getTime()) / Stay.oneDayInMs
    )
  }

  public getKey (): string {
    return `${dateFormat(this.from)}|${dateFormat(this.to)}`
  }

  public getPropertyKey (propertyId: number): string {
    return `${propertyId}|${this.getKey()}`
  }

  public isSameAs (stay: Stay): boolean {
    return this.getKey() === stay.getKey()
  }
}
