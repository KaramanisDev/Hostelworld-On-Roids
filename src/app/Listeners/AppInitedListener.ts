import type { Search } from 'DTOs/Search'
import type { PropertyPage } from 'DTOs/PropertyPage'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { ResizeObserverComponentPatcher } from 'Services/Hostelworld/Patchers/ResizeObserverComponentPatcher'
import { SearchPageHook } from 'Services/Hostelworld/SearchPageHook'
import { AppDiscountInterceptor } from 'Services/Hostelworld/AppDiscountInterceptor'
import { TrackerInterceptor } from 'Services/Hostelworld/TrackerInterceptor'
import {
  DeviceProfile,
  PropertyPageArea,
  SearchResultsArea,
  SearchResultsFilter,
  type DisplayedProperty
} from 'Services/Hostelworld/Page'
import { PropertyMetricsService, type ScheduledProperty } from 'Services/PropertyMetrics'
import type { Property } from 'Types/HostelworldSearch'
import { FilterModalRenderer } from 'UI/Renderers/FilterModal'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    TrackerInterceptor.blockTrackers()
    ResizeObserverComponentPatcher.useNativeObserver()
    this.applyRequestInterceptors()
    PropertyMetricsService.onStart(this.onScheduledPropertyStart.bind(this))

    await Promise.allSettled([
      FilterModalRenderer.render(),
      DeviceProfile.enforceMobile(),
      SearchResultsArea.hideFeatured(),
      SearchResultsArea.hideThirdPartyListings(),
      SearchResultsFilter.install(),
      PropertyPageArea.onPageChanged(this.onPropertyPageChanged.bind(this))
    ])

    await SearchResultsArea.onPropertiesDisplayed(
      this.onPropertiesDisplayed.bind(this)
    )
  }

  private applyRequestInterceptors (): void {
    AppDiscountInterceptor.enableAppDiscounts()

    SearchPageHook.onSearch({
      onSearchStarted: this.onSearchStarted.bind(this),
      onSearchUnrecognized: this.onSearchUnrecognized.bind(this),
      onSearchResults: this.onSearchResults.bind(this),
      onUnavailableProperties: this.onUnavailableProperties.bind(this)
    })
  }

  private onSearchStarted (search: Search): void {
    this.emit('worker:tasks:cancel')
    this.persistSearchInSession(search)
  }

  private onSearchUnrecognized (): void {
    this.emit('worker:tasks:cancel')
    this.forgetSearchInSession()
  }

  private onSearchResults (properties: Property[]): void {
    PropertyMetricsService.discardCollected()
    this.emit('hostelworld:search:intercepted', properties)
  }

  private onUnavailableProperties (properties: Property[]): void {
    this.emit('hostelworld:search:intercepted', properties)
  }

  private onPropertiesDisplayed (properties: DisplayedProperty[]): void {
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
    this.emit('property:metrics:requested', property)
  }
}
