import type { Property } from 'Types/HostelworldSearch'
import type { DisplayedProperty } from 'Types/DisplayedProperty'
import { pluck, promiseFallback, waitFor } from 'Utils'
import { NuxtApp } from './NuxtApp'
import { PropertyCardsArea } from './PropertyCardsArea'
import { ReactiveOverride } from './ReactiveOverride'
import { SearchResultsFilter } from './SearchResultsFilter'
import type {
  HostelworldDisplayedProperty,
  HostelworldSearchService,
  NuxtAppInstance,
  VuePropertyListComponent,
  VueSearchPageComponent,
  VuexStore
} from './HostelworldVueTypes'

type DisplayedPropertiesListener = (properties: DisplayedProperty[]) => void

export class SearchResultsArea {
  private static readonly propertyListSelector: string = '.search .property-list >div'
  private static readonly propertyListTimeoutInMs: number = 60 * 1000
  private static readonly refreshDelayInMs: number = 250
  private static scheduledRefresh: ReturnType<typeof setTimeout> | null = null

  public static hideFeatured (): Promise<void> {
    return NuxtApp.onRouteChanged(async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await this.propertyList()
      if (!component) return

      ReactiveOverride.pin(component, 'displayFeaturedProperties', false)
    })
  }

  public static hideThirdPartyListings (): Promise<void> {
    return NuxtApp.onRouteChanged(async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await this.propertyList()
      const searchPage: VueSearchPageComponent | undefined = component?.$parent
      if (!searchPage || !('isCityEnabled3PI' in searchPage)) return

      ReactiveOverride.pin(searchPage, 'isCityEnabled3PI', false)
      searchPage.reset3PIState?.()
    })
  }

  public static onPropertiesDisplayed (listener: DisplayedPropertiesListener): Promise<void> {
    return NuxtApp.onRouteChanged(async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await this.propertyList()
      if (!component) return

      if (component.isDisplayedPropertiesWatched) return
      component.isDisplayedPropertiesWatched = true

      const onDisplayedProperties: (properties: HostelworldDisplayedProperty[]) => void = (
        properties: HostelworldDisplayedProperty[]
      ): void => {
        if (!properties[0]) return

        listener(this.displayedProperties(properties))
      }

      component.$watch<HostelworldDisplayedProperty[]>('displayedProperties', onDisplayedProperties)
      component.$watch('cardComponent', () => {
        component.$nextTick(() => onDisplayedProperties(component.displayedProperties))
      })
    })
  }

  public static scheduleRefresh (): void {
    if (this.scheduledRefresh) return

    this.scheduledRefresh = setTimeout(() => {
      this.scheduledRefresh = null
      void this.refreshProperties()
    }, this.refreshDelayInMs)
  }

  public static async loadAllForCity (cityId: string, signal: AbortSignal): Promise<Property[] | null> {
    const store: VuexStore | undefined = await promiseFallback(NuxtApp.store())
    if (!store) return null

    const cityProperties: Property[] | null = await promiseFallback(this.cityProperties(store, cityId), null)
    if (!cityProperties) return null

    if (!await PropertyCardsArea.hasCards()) return null
    if (signal.aborted) return null

    const loaded: Property[] = store.state.search.properties
    const loadedPropertyIds: number[] = pluck(loaded, 'id')

    const allProperties: Property[] = [
      ...loaded,
      ...cityProperties.filter(property => !loadedPropertyIds.includes(property.id))
    ]

    await store.commit('search/setProperties', allProperties)

    return cityProperties
  }

  private static async cityProperties (store: VuexStore, cityId: string): Promise<Property[]> {
    const service: HostelworldSearchService = await store.$services.search()
    const { properties } = await service.search(cityId, null, null, 1, {})

    return [...properties]
  }

  private static async refreshProperties (): Promise<void> {
    if (SearchResultsFilter.isFiltering()) return SearchResultsFilter.refresh()

    const component: VuePropertyListComponent | undefined = await this.propertyList()
    if (!component) return

    const computedWatchers: VuePropertyListComponent['_computedWatchers'] = component._computedWatchers
    if (computedWatchers) {
      for (const watcher of Object.values(computedWatchers)) {
        watcher.dirty = true
      }
    }

    component.$forceUpdate()
  }

  private static async propertyList (): Promise<VuePropertyListComponent | undefined> {
    const app: NuxtAppInstance | undefined = await promiseFallback(NuxtApp.app())
    if (!app || NuxtApp.isPropertyRoute(app.$router.currentRoute)) return undefined

    return promiseFallback(this.propertyListComponent())
  }

  private static propertyListComponent (): Promise<VuePropertyListComponent> {
    return waitFor(
      (): VuePropertyListComponent | undefined => this.mountedPropertyListComponent(),
      this.propertyListTimeoutInMs,
      'The property list is not available within the specified time.'
    )
  }

  private static mountedPropertyListComponent (): VuePropertyListComponent | undefined {
    const element: HTMLElement | null = document.querySelector(this.propertyListSelector)

    return (element?.__vue__ ?? undefined) as VuePropertyListComponent | undefined
  }

  private static displayedProperties (properties: HostelworldDisplayedProperty[]): DisplayedProperty[] {
    return properties
      .filter(property => !property.is3PIProperty)
      .map(property => ({
        id: property.id,
        name: property.name,
        overallRating: property.rating?.total || null
      }))
  }
}
