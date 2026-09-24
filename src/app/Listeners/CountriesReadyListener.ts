import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

type CountriesPayload = {
  propertyId: number
  propertyName: string
  data: PropertyGuestsCountries
}

@Subscribe('worker:result:fetch:countries')
export class CountriesReadyListener extends AbstractListener {
  public handle (payload: CountriesPayload): void {
    void PropertyCardRenderer.updateCountries(payload.propertyId, payload.data)
    PropertyInsightsRenderer.updateCountries(payload.propertyId, payload.data)

    this.emit('property:metric:collected', 'countries', payload)
  }
}
