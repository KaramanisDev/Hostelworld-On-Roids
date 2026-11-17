import { Search } from 'DTOs/Search'
import type { HostelworldSearch, Property } from 'Types/HostelworldSearch'
import { SearchApiRequestsInterceptor } from 'Services/Hostelworld/SearchApiRequestsInterceptor'
import { SearchDataAdapter } from 'Services/Hostelworld/SearchDataAdapter'
import { SearchResultsArea } from 'Services/Hostelworld/Page'
import { pluck } from 'Utils'

export type SearchPageCallbacks = {
  onSearchStarted: (search: Search) => void
  onSearchUnrecognized: () => void
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

    const search: Search | null = Search.createFromHostelworldSearchUrl(url)
    this.latestCityId = search?.getCityId() ?? null

    if (!search) {
      callbacks.onSearchUnrecognized()
      return url
    }

    callbacks.onSearchStarted(search)

    return url
  }

  private static receiveResults (search: HostelworldSearch, callbacks: SearchPageCallbacks): HostelworldSearch {
    const adapted: HostelworldSearch = SearchDataAdapter.withoutPromotions(search)
    if (!this.latestCityId) return adapted

    callbacks.onSearchResults(adapted.properties)

    this.loadAllController = new AbortController()
    void this.loadUnavailableProperties(
      this.latestCityId,
      pluck(adapted.properties, 'id'),
      callbacks,
      this.loadAllController.signal
    )

    return adapted
  }

  private static async loadUnavailableProperties (
    cityId: string,
    availablePropertyIds: number[],
    callbacks: SearchPageCallbacks,
    signal: AbortSignal
  ): Promise<void> {
    const cityProperties: Property[] | null = await SearchResultsArea.loadAllForCity(cityId, signal)
    if (!cityProperties) return

    callbacks.onUnavailableProperties(
      cityProperties.filter(property => !availablePropertyIds.includes(property.id))
    )
  }
}
