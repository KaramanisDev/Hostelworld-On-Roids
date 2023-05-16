import { AbstractListener } from './AbstractListener'
import { Subscribe } from '../Core/EventBus'
import { XHRRequestInterceptor } from '../Utils/XHRRequestInterceptor'
import { HostelWorldSearchResponse } from '../Types/HostelworlSearchResponse'
import { HosterworldAdapter } from '../Services/HosterworldAdapter'

@Subscribe('app:inited')
export class AppInitedListener extends AbstractListener {
  public handle (): Promise<void> | void {
    XHRRequestInterceptor.addResponseDecorator(
      'https://prod.apigee.hostelworld.com/legacy-hwapi-service/2.2/cities',
      this.intercept
    )

    this.emit('hosterlworld:search:properties:intercepted')
  }

  private intercept (_: string, response: string): string {
    const adapted: HostelWorldSearchResponse = HosterworldAdapter.adaptSearch(
      JSON.parse(response)
    )

    return JSON.stringify(adapted)
  }
}
