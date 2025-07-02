import { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { HostelworldDataAdapter } from 'Services/HostelworldDataAdapter'
import { HostelworldDataManipulator } from 'Services/HostelworldDataManipulator'
import { HostelworldNetworkInterceptor } from 'Services/HostelworldNetworkInterceptor'
import { HostelworldDataHook } from 'Services/HostelworldDataHook'
import type { HostelworldSearch } from 'Types/HostelworldSearch'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    this.applyRequestInterceptors()

    await this.manipulateHostelworldData()

    await HostelworldDataHook.onDisplayedPropertiesUpdate((propertyIds: string[]) => {
      for (const propertyId of propertyIds) {
        this.emit('property:render', propertyId)
      }
    })
  }

  private applyRequestInterceptors (): void {
    HostelworldNetworkInterceptor
      .onSearchProperties(
        this.persistLatestSearch.bind(this),
        this.onSearchProperties.bind(this)
      )
      .onAllSearchProperties(
        this.updateCustomUrlToSearchAll.bind(this)
      )
  }

  private persistLatestSearch (url: URL): URL {
    const search: Search = Search.createFromHostelworldSearchUrl(url)
    this.persistSearchInSession(search)

    void HostelworldDataManipulator.displayAllProperties(search.getCityId())

    return url
  }

  private onSearchProperties (search: HostelworldSearch): HostelworldSearch {
    const adapted: HostelworldSearch = HostelworldDataAdapter.adaptSearch(search)

    this.emit('hostelworld:search:intercepted', adapted)

    return adapted
  }

  private updateCustomUrlToSearchAll (url: URL): URL {
    url.searchParams.delete('guests')
    url.searchParams.delete('num-nights')
    url.searchParams.delete('date-start')

    return url
  }

  private async manipulateHostelworldData (): Promise<void> {
    await Promise.all([
      HostelworldDataManipulator.hideFeaturedProperties(),
      HostelworldDataManipulator.showMaxPropertiesInSearch()
    ])
  }
}
