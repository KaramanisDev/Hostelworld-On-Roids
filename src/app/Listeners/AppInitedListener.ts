import { AbstractListener } from './AbstractListener'
import { Subscribe } from '../Core/EventBus'
import { XHRRequestInterceptor } from '../Utils/XHRRequestInterceptor'
import { HostelWorldSearchResponse } from '../Types/HostelworlSearchResponse'
import { HosterworldAdapter } from '../Services/HosterworldAdapter'
import { HostelworldFeatureEnforcer } from '../Services/HostelworldFeatureEnforcer'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public async handle (): Promise<void> {
    this.applyRequestInterceptors()

    await this.enforceFeaturesOnHostelworld()
  }

  private applyRequestInterceptors (): void {
    XHRRequestInterceptor
      .intercept({ url: 'https://prod.apigee.hostelworld.com/legacy-hwapi-service/2.2/cities' })
      .withResponse(this.adaptSearchResponse)

    XHRRequestInterceptor
      .intercept({ url: 'https://prod.apigee.hostelworld.com/socialcues-service/api/v1/cities'})
      .shouldNotFail(JSON.stringify({ nationalities: [], profileImages: { all: [], soloPax: [] } }))
      .withTimeout(90 * 1000)
  }

  private adaptSearchResponse (response: string): string {
    const adapted: HostelWorldSearchResponse = HosterworldAdapter.adaptSearch(
      JSON.parse(response)
    )

    return JSON.stringify(adapted)
  }

  private async enforceFeaturesOnHostelworld (): Promise<void> {
    await HostelworldFeatureEnforcer.enableViewPropertySocialCues()
    await HostelworldFeatureEnforcer.enableSearchCitySocialCues()
    await HostelworldFeatureEnforcer.enableSearchPropertySocialCues()
    await HostelworldFeatureEnforcer.enableSearchUnavailableProperties()
  }
}
