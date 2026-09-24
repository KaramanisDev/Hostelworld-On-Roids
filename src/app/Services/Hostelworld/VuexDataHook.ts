import { VueComponentAccessor } from 'Services/Hostelworld/VueComponentAccessor'
import type { HostelworldPropertyDetails, VuePropertyListComponent } from 'Services/Hostelworld/VueComponentAccessor'
import { PropertyPage } from 'DTOs/PropertyPage'
import type { Property } from 'Types/HostelworldSearch'
import { promiseFallback, waitForProperty } from 'Utils'

type VuexRoute = {
  name: string | null
  params: Record<string, string | number>
  query: Record<string, string>
}

type VuexRouter = {
  currentRoute: VuexRoute
  onReady: (callback: () => void) => void
  afterEach: (callback: () => void) => void
}

type NuxtApp = {
  _isMounted: boolean
  $router: VuexRouter
}

type NuxtReadyHook = (callback: () => void) => void

export class VuexDataHook {
  private static readonly propertyRouteName: string = 'hosteldetails.php-name-city-id'
  private static displayedPropertyPageKey: string | null = null

  public static async onPropertiesDisplayed (callback: (propertyIds: number[]) => void): Promise<void> {
    const onDisplayedPropertiesUpdate: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(
        VueComponentAccessor.propertyListComponent()
      )
      if (!component) return

      if (component.isDisplayedPropertiesWatched) return
      component.isDisplayedPropertiesWatched = true

      const onDisplayedProperties: (properties: Property[]) => void = (properties: Property[]): void => {
        if (!properties[0]) return

        callback(
          properties
            .filter(property => !property.is3PIProperty)
            .map(property => property.id)
        )
      }

      component.$watch<Property[]>('displayedProperties', onDisplayedProperties)
      component.$watch('cardComponent', () => {
        component.$nextTick(() => onDisplayedProperties(component.displayedProperties))
      })
    }

    return this.onRouteChanged(
      onDisplayedPropertiesUpdate.bind(this)
    )
  }

  public static async onPropertyPageChanged (callback: (page: PropertyPage | null) => void): Promise<void> {
    const app: NuxtApp = await waitForProperty(window, '$nuxt', 60 * 1000)

    const onPropertyPageUpdate: () => Promise<void> = async (): Promise<void> => {
      const { name, params, query }: VuexRoute = app.$router.currentRoute
      const propertyId: number = Number(params.id)

      if (name !== this.propertyRouteName || !Number.isInteger(propertyId)) {
        if (!this.displayedPropertyPageKey) return

        this.displayedPropertyPageKey = null
        callback(null)

        return
      }

      const pageKey: string = `${propertyId}|${query.from}|${query.to}`
      if (pageKey === this.displayedPropertyPageKey) return
      if (this.displayedPropertyPageKey) callback(null)
      this.displayedPropertyPageKey = pageKey

      const details: HostelworldPropertyDetails | undefined = await promiseFallback(
        VueComponentAccessor.propertyDetails(propertyId)
      )
      await this.waitForAppMount(app)
      if (!details || pageKey !== this.displayedPropertyPageKey) return

      callback(new PropertyPage({
        id: propertyId,
        name: details.name,
        overallRating: details.rating?.total || null,
        from: new Date(query.from),
        to: new Date(query.to)
      }))
    }

    return this.onRouteChanged(
      onPropertyPageUpdate.bind(this)
    )
  }

  public static async onRouteChanged (callback: () => void | Promise<void>): Promise<void> {
    const router: VuexRouter = await waitForProperty(window, '$nuxt.$router', 60 * 1000)

    router.onReady(callback.bind(this))
    router.afterEach(callback.bind(this))
  }

  private static async waitForAppMount (app: NuxtApp): Promise<void> {
    if (app._isMounted) return

    const onNuxtReady: NuxtReadyHook = await waitForProperty(window, 'onNuxtReady', 60 * 1000)

    return new Promise(resolve => onNuxtReady(resolve))
  }
}
