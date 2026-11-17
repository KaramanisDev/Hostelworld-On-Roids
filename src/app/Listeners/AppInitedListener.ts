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
import { PropertyMetricsService, type MetricsRequest } from 'Services/PropertyMetrics'
import type { Property } from 'Types/HostelworldSearch'
import { FilterModalRenderer } from 'UI/Renderers/FilterModal'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    TrackerInterceptor.blockTrackers()
    ResizeObserverComponentPatcher.useNativeObserver()
    this.applyRequestInterceptors()
    PropertyMetricsService.onStart(this.onMetricsRequestStarted.bind(this))

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

    const isSameSearch: boolean = this.session.isLatestSearch(search)
    this.session.updateLatestSearch(search)
    if (isSameSearch) return

    PropertyCardRenderer.clear()
  }

  private onSearchUnrecognized (): void {
    this.emit('worker:tasks:cancel')
    this.session.forgetLatestSearch()
    PropertyCardRenderer.clear()
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

  private onMetricsRequestStarted (request: MetricsRequest): void {
    this.emit('property:metrics:requested', request)
  }
}
