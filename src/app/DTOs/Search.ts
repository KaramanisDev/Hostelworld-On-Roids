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
}
