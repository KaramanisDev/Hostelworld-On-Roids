import { Search } from 'DTOs/Search'
import type { HostelworldSearch, Property } from 'Types/HostelworldSearch'
import { SearchApiRequestsInterceptor } from 'Services/Hostelworld/SearchApiRequestsInterceptor'
import { SearchDataAdapter } from 'Services/Hostelworld/SearchDataAdapter'
import { SearchPropertyListComponentPatcher } from 'Services/Hostelworld/Patchers/SearchPropertyListComponentPatcher'
import { pluck } from 'Utils'

export type SearchPageCallbacks = {
  onSearchStarted: (search: Search) => void
  onSearchResults: (properties: Property[]) => void
  onUnavailableProperties: (properties: Property[]) => void
}

export class SearchPageHook {
  private static latestCityId: string | null = null
  private static loadAllController: AbortController | null = null

  public static onSearch (callbacks: SearchPageCallbacks): void {
    SearchApiRequestsInterceptor
      .interceptSearch(
        (url: URL): URL => this.startSearch(url, callbacks),
        (search: HostelworldSearch): HostelworldSearch => this.receiveResults(search, callbacks)
      )
      .interceptSearchAll(
        SearchDataAdapter.withoutPromotions.bind(SearchDataAdapter)
      )
  }

  private static startSearch (url: URL, callbacks: SearchPageCallbacks): URL {
    this.loadAllController?.abort()

    const search: Search = Search.createFromHostelworldSearchUrl(url)
    this.latestCityId = search.getCityId()
    callbacks.onSearchStarted(search)

    return url
  }

  private static receiveResults (search: HostelworldSearch, callbacks: SearchPageCallbacks): HostelworldSearch {
    const adapted: HostelworldSearch = SearchDataAdapter.withoutPromotions(search)

    callbacks.onSearchResults(adapted.properties)
    if (!this.latestCityId) return adapted

    this.loadAllController = new AbortController()
    void SearchPropertyListComponentPatcher.loadAllForCity(
      this.latestCityId,
      pluck(adapted.properties, 'id'),
      callbacks.onUnavailableProperties,
      this.loadAllController.signal
    )

    return adapted
  }
}
