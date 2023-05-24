import type { Metrics } from 'Services/AvailabilityAnalyzer'
import { toPercent } from 'Utils'

export class AvailabilityMetrics {
  private max!: Metrics
  private current!: Metrics

  constructor (attributes: Record<string, Metrics>) {
    Object.assign(this, attributes)
  }

  public getMixedBeds (): number {
    return this.current.mixed
  }

  public getMaxMixedBeds (): number {
    return this.max.mixed
  }

  public getMixedBedsPercentage(): number {
    return toPercent(this.getMixedBeds(), this.getMaxMixedBeds())
  }

  public getFemaleBeds (): number {
    return this.current.female
  }

  public getMaxFemaleBeds (): number {
    return this.max.female
  }

  public getFemaleBedsPercentage(): number {
    return toPercent(this.getFemaleBeds(), this.getMaxFemaleBeds())
  }

  public getPrivateRooms (): number {
    return this.current.private
  }

  public getMaxPrivateRooms (): number {
    return this.max.private
  }

  public getPrivateRoomsPercentage(): number {
    return toPercent(this.getPrivateRooms(), this.getMaxPrivateRooms())
  }

  public getGuests (): number {
    return this.current.total
  }

  public getMaxGuests (): number {
    return this.max.total
  }

  public getGuestsPercentage(): number {
    return toPercent(this.getGuests(), this.getMaxGuests())
  }
}
