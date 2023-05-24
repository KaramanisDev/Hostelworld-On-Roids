import { toPercent } from 'Utils'

export class ReviewMetrics {
  private male!: number
  private female!: number
  private other!: number
  private solo!: number
  private total!: number

  constructor (attributes: Record<string, number>) {
    Object.assign(this, attributes)
  }

  public getMale (): number {
    return this.male
  }

  public getMalePercentage (): number {
    return toPercent(this.getMale(), this.total)
  }

  public getFemale (): number {
    return this.female
  }

  public getFemalePercentage (): number {
    return toPercent(this.getFemale(), this.getTotal())
  }

  public getOther (): number {
    return this.other
  }

  public getOtherPercentage (): number {
    return toPercent(this.getOther(), this.getTotal())
  }

  public getSolo (): number {
    return this.solo
  }

  public getSoloPercentage (): number {
    return toPercent(this.solo, this.getTotal())
  }

  public getTotal (): number {
    return this.total
  }
}
