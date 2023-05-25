import { Search } from 'DTOs/Search'
import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { HosterworldDataAdapter } from 'Services/HosterworldDataAdapter'
import { HostelworldFeatureToggler } from 'Services/HostelworldFeatureToggler'
import { HostelworldDataManipulator } from 'Services/HostelworldDataManipulator'
import { HostelworldNetworkInterceptor } from 'Services/HostelworldNetworkInterceptor'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    this.applyRequestInterceptors()

    await Promise.all([
      this.toggleHostelworldFeatures(),
      this.manipulateHostelworldData()
    ])
  }

  private applyRequestInterceptors (): void {
    HostelworldNetworkInterceptor
      .guardAgainstFailingCitySocialCues()
      .increaseSearchUnavailablePropertiesPerPage()
      .onSearchProperties(
        this.persistLatestSearch.bind(this),
        HosterworldDataAdapter.adaptSearch
      )
  }

  private persistLatestSearch (url: URL): URL {
    this.persistSearchInSession(
      Search.createFromSearchUrl(url)
    )

    return url
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
