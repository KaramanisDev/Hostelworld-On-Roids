import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'

@Subscribe('worker:disconnected')
export class WorkerDisconnectedListener extends AbstractListener {
  public handle (): void {
    PropertyCardRenderer.showDisconnected()
    PropertyInsightsRenderer.showDisconnected()
  }
}
