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
      .intercept('https://prod.apigee.hostelworld.com/legacy-hwapi-service/2.2/cities')
      .withResponse(this.adaptSearchResponse)

    XHRRequestInterceptor
      .intercept('https://prod.apigee.hostelworld.com/socialcues-service/api/v1/cities', 'GET', /^(?!200$)\d+$/)
      .withResponse(JSON.stringify({ nationalities: [], profileImages: { all: [], soloPax: [] } }))
      .withStatus(200)
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
