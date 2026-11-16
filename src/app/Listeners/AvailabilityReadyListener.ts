import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { Stay } from 'DTOs/Stay'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'

type AvailabilityPayload = {
  propertyId: number
  propertyName: string
  stay: Stay
  data: PropertyAvailability | null
}

@Subscribe('worker:result:fetch:availability')
export class AvailabilityReadyListener extends AbstractListener {
  public handle (payload: AvailabilityPayload): void {
    const metrics: AvailabilityMetrics | null = payload.data ? new AvailabilityMetrics(payload.data) : null

    if (this.isLatestSearchStay(payload.stay)) {
      PropertyCardRenderer.updateAvailabilityMetrics(payload.propertyId, metrics)
    }
    PropertyInsightsRenderer.updateAvailabilityMetrics(payload.propertyId, payload.stay, metrics)

    this.emit('property:metric:collected', 'availability', payload)
  }
}
