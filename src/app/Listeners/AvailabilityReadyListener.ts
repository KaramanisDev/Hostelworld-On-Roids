import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { PropertyAvailability } from 'Services/Hostelworld/Api/AvailabilityClient'

type AvailabilityPayload = {
  propertyId: number
  propertyName: string
  data: PropertyAvailability
}

@Subscribe('worker:result:fetch:availability')
export class AvailabilityReadyListener extends AbstractListener {
  public handle (payload: AvailabilityPayload): void {
    const metrics: AvailabilityMetrics = new AvailabilityMetrics(payload.data)
    PropertyCardRenderer.updateAvailabilityMetrics(payload.propertyId, metrics)

    this.emit('property:metric:collected', 'availability', payload)
  }
}
