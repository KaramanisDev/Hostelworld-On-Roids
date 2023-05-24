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

    await this.toggleHostelworldFeatures()
    await this.manipulateHostelworldData()
  }

  private applyRequestInterceptors (): void {
    HostelworldNetworkInterceptor
      .guardAgainstFailingCitySocialCues()
      .increaseSearchUnavailablePropertiesPerPage()
      .onSearchProperties(HosterworldDataAdapter.adaptSearch)
  }

  private async toggleHostelworldFeatures (): Promise<void> {
    await HostelworldFeatureToggler.enableViewPropertySocialCues()
    await HostelworldFeatureToggler.enableSearchCitySocialCues()
    await HostelworldFeatureToggler.enableSearchPropertySocialCues()
    await HostelworldFeatureToggler.enableSearchUnavailableProperties()
  }

  private async manipulateHostelworldData (): Promise<void> {
    await HostelworldDataManipulator.hideFeaturedProperties()
    await HostelworldDataManipulator.hideSellingOutFastLabel()
    await HostelworldDataManipulator.showMaxPropertiesInSearch()
    await HostelworldDataManipulator.showMaxUnavailablePropertiesAndSocialCues()
  }
}
