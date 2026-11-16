import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import type { WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type CountriesPayload = WorkerTaskPayload<'fetch:countries'>

@Subscribe('worker:result:fetch:countries')
export class CountriesReadyListener extends AbstractListener {
  public handle (payload: CountriesPayload): void {
    if (this.isLatestSearchStay(payload.stay)) {
      void PropertyCardRenderer.updateCountries(payload.propertyId, payload.data)
    }
    PropertyInsightsRenderer.updateCountries(payload.propertyId, payload.stay, payload.data)

    this.emit('property:metric:collected', 'countries', payload)
  }
}
