import { dateAddDays } from 'Utils'

export class Search {
  private to!: Date
  private from!: Date

  constructor (attributes: Record<string, Date>) {
    Object.assign(this, attributes)
  }

  public getTo (): Date {
    return this.to
  }

  public getFrom (): Date {
    return this.from
  }

  public static createFromSearchUrl (url: URL): typeof this.prototype {
    const parameters: URLSearchParams = url.searchParams
    if (!parameters.has('date-start') || !parameters.has('num-nights')) {
      throw new Error('Not a hostelworld search url.')
    }

    const from: Date = new Date(<string>parameters.get('date-start'))
    const daysToAdd: number = Number(parameters.get('num-nights'))

    return new this({
      from, to: dateAddDays(from, daysToAdd)
    })
  }
}
