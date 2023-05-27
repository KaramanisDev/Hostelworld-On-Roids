import type { HostelworldSearch } from 'Services/HosterworldDataAdapter'
import { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { HosterworldDataAdapter } from 'Services/HosterworldDataAdapter'
import { HostelworldFeatureToggler } from 'Services/HostelworldFeatureToggler'
import { HostelworldDataManipulator } from 'Services/HostelworldDataManipulator'
import { HostelworldNetworkInterceptor } from 'Services/HostelworldNetworkInterceptor'
import { HostelworldDataHook } from 'Services/HostelworldDataHook'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    this.applyRequestInterceptors()

    await Promise.all([
      this.toggleHostelworldFeatures(),
      this.manipulateHostelworldData()
    ])

    await HostelworldDataHook.onDisplayedPropertiesUpdate((propertyIds: string[]) => {
      for (const propertyId of propertyIds) {
        this.emit('property:render', propertyId)
      }
    })
  }

  private applyRequestInterceptors (): void {
    HostelworldNetworkInterceptor
      .guardAgainstFailingCitySocialCues()
      .increaseSearchUnavailablePropertiesPerPage()
      .onSearchProperties(
        this.persistLatestSearch.bind(this),
        this.onSearchProperties.bind(this)
      )
  }

  private persistLatestSearch (url: URL): URL {
    this.persistSearchInSession(
      Search.createFromSearchUrl(url)
    )

    return url
  }

  private onSearchProperties (search: HostelworldSearch): HostelworldSearch {
    const adapted: HostelworldSearch = HosterworldDataAdapter.adaptSearch(search)

    this.emit('properties:intercepted', adapted)

    return adapted
  }

  private async toggleHostelworldFeatures (): Promise<void> {
    await Promise.all([
      HostelworldFeatureToggler.enableViewPropertySocialCues(),
      HostelworldFeatureToggler.enableSearchCitySocialCues(),
      HostelworldFeatureToggler.enableSearchPropertySocialCues(),
      HostelworldFeatureToggler.enableSearchUnavailableProperties()
    ])
  }

  private async manipulateHostelworldData (): Promise<void> {
    await Promise.all([
      HostelworldDataManipulator.hideFeaturedProperties(),
      HostelworldDataManipulator.hideSellingOutFastLabel(),
      HostelworldDataManipulator.showMaxPropertiesInSearch(),
      HostelworldDataManipulator.showMaxUnavailablePropertiesAndSocialCues()
    ])
  }
}
