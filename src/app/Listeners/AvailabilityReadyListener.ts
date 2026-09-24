import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'

type AvailabilityPayload = {
  propertyId: number
  propertyName: string
  from: string
  to: string
  data: PropertyAvailability
}

@Subscribe('worker:result:fetch:availability')
export class AvailabilityReadyListener extends AbstractListener {
  public handle (payload: AvailabilityPayload): void {
    const metrics: AvailabilityMetrics = new AvailabilityMetrics(payload.data)
    const from: Date = new Date(payload.from)
    const to: Date = new Date(payload.to)

    if (this.isLatestSearchStay(from, to)) {
      PropertyCardRenderer.updateAvailabilityMetrics(payload.propertyId, metrics)
    }
    PropertyInsightsRenderer.updateAvailabilityMetrics(payload.propertyId, from, to, metrics)

    this.emit('property:metric:collected', 'availability', payload)
  }
}
