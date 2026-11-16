import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type AvailabilityPayload = WorkerTaskPayload<'fetch:availability'>

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
