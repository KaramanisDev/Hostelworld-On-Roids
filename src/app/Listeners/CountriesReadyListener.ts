import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

type CountriesPayload = {
  propertyId: number
  propertyName: string
  data: PropertyGuestsCountries
}

@Subscribe('worker:result:fetch:countries')
export class CountriesReadyListener extends AbstractListener {
  public handle (payload: CountriesPayload): void {
    void PropertyCardRenderer.updateCountries(
      payload.propertyId, payload.propertyName, payload.data
    )

    this.emit('property:metric:collected', 'countries', payload)
  }
}
