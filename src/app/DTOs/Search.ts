import { Stay } from 'DTOs/Stay'
import { dateAddDays } from 'Utils'

type SearchAttributes = {
  stay: Stay
  cityId: string
}

export class Search {
  private stay!: Stay
  private cityId!: string

  constructor (attributes: SearchAttributes) {
    Object.assign(this, attributes)
  }

  public getStay (): Stay {
    return this.stay
  }

  public getCityId (): string {
    return this.cityId
  }

  public static createFromHostelworldSearchUrl (url: URL): Search | null {
    const parameters: URLSearchParams = url.searchParams
    if (!parameters.has('date-start') || !parameters.has('num-nights')) return null

    const from: Date = new Date(<string>parameters.get('date-start'))
    const daysToAdd: number = Number(parameters.get('num-nights'))

    const match: RegExpMatchArray | null = url.toString().match(/cities\/(\d+)\/properties\//)
    if (!match) return null

    const [, cityId]: [string, string] = match as [string, string]

    return new this({
      cityId, stay: new Stay({ from, to: dateAddDays(from, daysToAdd) })
    })
  }
}
