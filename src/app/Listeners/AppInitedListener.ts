import { Search } from 'DTOs/Search'
import type { PropertyPage } from 'DTOs/PropertyPage'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchDataAdapter } from 'Services/Hostelworld/SearchDataAdapter'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'
import { DevicePatcher } from 'Services/Hostelworld/Patchers/DevicePatcher'
import { SearchApiRequestsInterceptor } from 'Services/Hostelworld/SearchApiRequestsInterceptor'
import { AppDiscountInterceptor } from 'Services/Hostelworld/AppDiscountInterceptor'
import { VuexDataHook } from 'Services/Hostelworld/VuexDataHook'
import type { HostelworldSearch, Property } from 'Types/HostelworldSearch'
import { FilterModalRenderer } from 'UI/Renderers/FilterModal'
import { pluck } from 'Utils'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  private loadAllController: AbortController | null = null

  public async handle (): Promise<void> {
    this.applyRequestInterceptors()

    await Promise.allSettled([
      FilterModalRenderer.render(),
      DevicePatcher.enforceMobile(),
      SearchPropertyListComponentPatcher.disableFeatured(),
      SearchPropertyListComponentPatcher.disableThirdPartyProperties(),
      SearchPropertyListComponentPatcher.installPropertiesFilter(),
      VuexDataHook.onPropertyPageChanged(this.onPropertyPageChanged.bind(this))
    ])

    const renderProperties: (propertyIds: number[]) => void = (propertyIds: number[]) => {
      for (const propertyId of propertyIds) {
        this.emit('property:render', propertyId)
      }
    }
    await VuexDataHook.onPropertiesDisplayed(
      renderProperties.bind(this)
    )
  }

  private applyRequestInterceptors (): void {
    AppDiscountInterceptor.enableAppDiscounts()

    SearchApiRequestsInterceptor
      .interceptSearch(
        this.persistLatestSearch.bind(this),
        this.onSearchProperties.bind(this)
      )
      .interceptSearchAll(
        SearchDataAdapter.withoutPromotions.bind(SearchDataAdapter)
      )
  }

  private persistLatestSearch (url: URL): URL {
    this.loadAllController?.abort()

    const search: Search = Search.createFromHostelworldSearchUrl(url)
    this.persistSearchInSession(search)

    return url
  }

  private onSearchProperties (search: HostelworldSearch): HostelworldSearch {
    const adapted: HostelworldSearch = SearchDataAdapter.withoutPromotions(search)

    this.emit('property:composition:reset')
    this.emit('hostelworld:search:intercepted', adapted.properties)

    const latestSearch: Search | undefined = this.latestSearchInSession()
    if (!latestSearch) return adapted

    this.loadAllController = new AbortController()
    void SearchPropertyListComponentPatcher.loadAllForCity(
      latestSearch.getCityId(),
      pluck(adapted.properties, 'id'),
      this.onUnavailableProperties.bind(this),
      this.loadAllController.signal
    )

    return adapted
  }

  private onUnavailableProperties (properties: Property[]): void {
    this.emit('hostelworld:search:intercepted', properties)
  }

  private onPropertyPageChanged (page: PropertyPage | null): void {
    if (!page) {
      this.emit('property:page:left')
      return
    }

    this.emit('property:page:displayed', page)
  }
}
