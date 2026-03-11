import { dateAddDays } from 'Utils'

export class Search {
  private to!: Date
  private from!: Date
  private cityId!: string

  constructor (attributes: Record<string, Date | string>) {
    Object.assign(this, attributes)
  }

  public getTo (): Date {
    return this.to
  }

  public getFrom (): Date {
    return this.from
  }

  public getCityId (): string {
    return this.cityId
  }

  public static createFromHostelworldSearchUrl (url: URL): typeof this.prototype {
    const parameters: URLSearchParams = url.searchParams
    if (!parameters.has('date-start') || !parameters.has('num-nights')) {
      throw new Error('Not a hostelworld search url.')
    }

    const from: Date = new Date(<string>parameters.get('date-start'))
    const daysToAdd: number = Number(parameters.get('num-nights'))

    const match: RegExpMatchArray | null = url.toString().match(/cities\/(\d+)\/properties\//)
    if (!match) {
      throw new Error('Not a hostelworld search url.')
    }
    const [, cityId]: [string, string] = match as [string, string]

    return new this({
      cityId, from, to: dateAddDays(from, daysToAdd)
    })
  }
}
