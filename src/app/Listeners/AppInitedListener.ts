import type { Search } from 'DTOs/Search'
import type { PropertyPage } from 'DTOs/PropertyPage'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'
import { DevicePatcher } from 'Services/Hostelworld/Patchers/DevicePatcher'
import { SearchPageHook } from 'Services/Hostelworld/SearchPageHook'
import { AppDiscountInterceptor } from 'Services/Hostelworld/AppDiscountInterceptor'
import { VuexDataHook } from 'Services/Hostelworld/VuexDataHook'
import { PropertyMetricsScheduler } from 'Services/PropertyMetricsScheduler'
import { PropertyCompositionBuffer } from 'Services/PropertyCompositionBuffer'
import type { ScheduledProperty } from 'Services/PropertyMetricsScheduler'
import type { Property } from 'Types/HostelworldSearch'
import { FilterModalRenderer } from 'UI/Renderers/FilterModal'
import { WorkerRPCProxy } from 'Communication/WorkerRPCProxy'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    this.applyRequestInterceptors()
    PropertyMetricsScheduler.onStart(this.onScheduledPropertyStart.bind(this))

    await Promise.allSettled([
      FilterModalRenderer.render(),
      DevicePatcher.enforceMobile(),
      SearchPropertyListComponentPatcher.disableFeatured(),
      SearchPropertyListComponentPatcher.disableThirdPartyProperties(),
      SearchPropertyListComponentPatcher.installPropertiesFilter(),
      VuexDataHook.onPropertyPageChanged(this.onPropertyPageChanged.bind(this))
    ])

    await VuexDataHook.onPropertiesDisplayed(
      this.onPropertiesDisplayed.bind(this)
    )
  }

  private applyRequestInterceptors (): void {
    AppDiscountInterceptor.enableAppDiscounts()

    SearchPageHook.onSearch({
      onSearchStarted: this.onSearchStarted.bind(this),
      onSearchResults: this.onSearchResults.bind(this),
      onUnavailableProperties: this.onUnavailableProperties.bind(this)
    })
  }

  private onSearchStarted (search: Search): void {
    this.emit('worker:tasks:cancel')
    this.persistSearchInSession(search)
  }

  private onSearchResults (properties: Property[]): void {
    PropertyCompositionBuffer.clear()
    this.emit('hostelworld:search:intercepted', properties)
  }

  private onUnavailableProperties (properties: Property[]): void {
    this.emit('hostelworld:search:intercepted', properties)
  }

  private onPropertiesDisplayed (properties: Property[]): void {
    this.emit('hostelworld:properties:displayed', properties)
  }

  private onPropertyPageChanged (page: PropertyPage | null): void {
    this.emit('worker:tasks:cancel')

    if (!page) {
      this.emit('property:page:left')
      return
    }

    this.emit('property:page:displayed', page)
  }

  private onScheduledPropertyStart (property: ScheduledProperty): void {
    WorkerRPCProxy.call('fetch:reviews', property.id, property.name, property.overallRating)
    WorkerRPCProxy.call('fetch:availability', property.id, property.name, property.stay)
    WorkerRPCProxy.call('fetch:countries', property.id, property.name, property.stay)
  }
}
