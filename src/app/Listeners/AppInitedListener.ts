import { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { SearchDataAdapter } from 'Services/Hostelworld/SearchDataAdapter'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'
import { SearchApiRequestsInterceptor } from 'Services/Hostelworld/SearchApiRequestsInterceptor'
import { VuexDataHook } from 'Services/Hostelworld/VuexDataHook'
import type { HostelworldSearch } from 'Types/HostelworldSearch'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    this.applyRequestInterceptors()

    await Promise.all([
      SearchPropertyListComponentPatcher.disableFeatured(),
      SearchPropertyListComponentPatcher.disablePagination()
    ])

    const renderProperties: Function = (propertyIds: number[]) => {
      for (const propertyId of propertyIds) {
        this.emit('property:render', propertyId)
      }
    }
    await VuexDataHook.onPropertiesDisplayed(
      renderProperties.bind(this)
    )
  }

  private applyRequestInterceptors (): void {
    SearchApiRequestsInterceptor
      .interceptSearch(
        this.persistLatestSearch.bind(this),
        this.onSearchProperties.bind(this)
      )
      .interceptSearchAll(
        this.onAllSearchProperties.bind(this)
      )
  }

  private persistLatestSearch (url: URL): URL {
    const search: Search = Search.createFromHostelworldSearchUrl(url)
    this.persistSearchInSession(search)

    void SearchPropertyListComponentPatcher.loadAllForCity(search.getCityId())

    return url
  }

  private onSearchProperties (search: HostelworldSearch): HostelworldSearch {
    const adapted: HostelworldSearch = SearchDataAdapter.stripPromotions(search)

    this.emit('hostelworld:search:intercepted', adapted.properties)

    return adapted
  }

  private onAllSearchProperties (search: HostelworldSearch): HostelworldSearch {
    const adapted: HostelworldSearch = SearchDataAdapter.stripPromotions(search)

    this.emit('hostelworld:search:intercepted', adapted.properties)

    return adapted
  }
}
