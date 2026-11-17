import { PropertyPage } from 'DTOs/PropertyPage'
import { Stay } from 'DTOs/Stay'
import { promiseFallback, waitFor } from 'Utils'
import { NuxtApp } from './NuxtApp'
import type { HostelworldPropertyDetails, NuxtAppInstance, VueRoute, VuexStore } from './HostelworldVueTypes'

type PropertyPageListener = (page: PropertyPage | null) => void

export class PropertyPageArea {
  private static readonly detailsTimeoutInMs: number = 30 * 1000
  private static displayedPageKey: string | null = null

  public static async onPageChanged (listener: PropertyPageListener): Promise<void> {
    const app: NuxtAppInstance = await NuxtApp.app()

    const onPropertyPageUpdate: () => Promise<void> = async (): Promise<void> => {
      const route: VueRoute = app.$router.currentRoute
      const propertyId: number = Number(route.params.id)

      if (!NuxtApp.isPropertyRoute(route) || !Number.isInteger(propertyId)) {
        if (!this.displayedPageKey) return

        this.displayedPageKey = null
        listener(null)

        return
      }

      const stay: Stay = new Stay({ from: new Date(route.query.from), to: new Date(route.query.to) })
      const pageKey: string = stay.getPropertyKey(propertyId)
      if (pageKey === this.displayedPageKey) return
      if (this.displayedPageKey) listener(null)
      this.displayedPageKey = pageKey

      const details: HostelworldPropertyDetails | undefined = await promiseFallback(this.propertyDetails(propertyId))
      await NuxtApp.hasMounted()
      if (!details || pageKey !== this.displayedPageKey) return

      listener(new PropertyPage({
        id: propertyId,
        name: details.name,
        overallRating: details.rating?.total || null,
        stay
      }))
    }

    return NuxtApp.onRouteChanged(onPropertyPageUpdate)
  }

  private static async propertyDetails (propertyId: number): Promise<HostelworldPropertyDetails> {
    const store: VuexStore = await NuxtApp.store()

    return waitFor(
      (): HostelworldPropertyDetails | undefined => {
        const details: HostelworldPropertyDetails | null = store.state.property.property

        return details && Number(details.id) === propertyId ? details : undefined
      },
      this.detailsTimeoutInMs,
      `Details of property ${propertyId} are not available within the specified time.`
    )
  }
}
