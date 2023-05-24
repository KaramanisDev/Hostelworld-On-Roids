import { AbstractListener } from './AbstractListener'
import { Subscribe } from 'Core/EventBus'
import { HosterworldDataAdapter } from 'Services/HosterworldDataAdapter'
import { HostelworldFeatureEnforcer } from 'Services/HostelworldFeatureToggler'
import { HostelworldNetworkInterceptor } from 'Services/HostelworldNetworkInterceptor'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    this.applyRequestInterceptors()

    await this.enforceFeaturesOnHostelworld()
  }

  private applyRequestInterceptors (): void {
    HostelworldNetworkInterceptor
      .guardAgainstFailingCitySocialCues()
      .increaseSearchUnavailablePropertiesPerPage()
      .onSearchProperties(HosterworldDataAdapter.adaptSearch)
  }

  private async enforceFeaturesOnHostelworld (): Promise<void> {
    await HostelworldFeatureEnforcer.enableViewPropertySocialCues()
    await HostelworldFeatureEnforcer.enableSearchCitySocialCues()
    await HostelworldFeatureEnforcer.enableSearchPropertySocialCues()
    await HostelworldFeatureEnforcer.enableSearchUnavailableProperties()
  }
}
