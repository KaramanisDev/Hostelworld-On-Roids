import type { Property } from 'Types/HostelworldSearch'
import { VuexDataHook } from 'Services/Hostelworld/VuexDataHook'
import { VueComponentAccessor } from 'Services/Hostelworld/VueComponentAccessor'
import type {
  VuePropertyListComponent,
  VueSearchPageComponent,
  VuexStore,
  VuexStoreViewModel
} from 'Services/Hostelworld/VueComponentAccessor'
import { emptyFunction, pluck, promiseFallback, waitForElement } from 'Utils'

export type PropertyFilterPredicate = (propertyId: number) => boolean

type FilterState = {
  version: number
}

export class SearchPropertyListComponentPatcher {
  private static filterPredicate: PropertyFilterPredicate | null = null
  private static filterState: FilterState | null = null
  private static readonly filteredPropertiesGetters: string[] = [
    'search/filteredProperties',
    'search/filteredHWProperties'
  ]

  public static async disableFeatured (): Promise<void> {
    const disableFeaturedProperties: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(
        VueComponentAccessor.propertyListComponent()
      )
      if (!component) return

      const displayFeaturedProperties: boolean = false
      Object.defineProperty(component, 'displayFeaturedProperties', {
        configurable: true,
        get: () => displayFeaturedProperties,
        set: emptyFunction
      })
    }

    return VuexDataHook.onRouteChanged(
      disableFeaturedProperties.bind(this)
    )
  }

  public static async disableThirdPartyProperties (): Promise<void> {
    const disableThirdPartyInventory: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(
        VueComponentAccessor.propertyListComponent()
      )
      const searchPage: VueSearchPageComponent | undefined = component?.$parent
      if (!searchPage || !('isCityEnabled3PI' in searchPage)) return

      const isCityEnabled3PI: boolean = false
      Object.defineProperty(searchPage, 'isCityEnabled3PI', {
        configurable: true,
        get: () => isCityEnabled3PI,
        set: emptyFunction
      })

      searchPage.reset3PIState?.()
    }

    return VuexDataHook.onRouteChanged(
      disableThirdPartyInventory.bind(this)
    )
  }

  public static async installPropertiesFilter (): Promise<void> {
    const hijackFilteredProperties: () => Promise<void> = async (): Promise<void> => {
      const store: VuexStore | undefined = await promiseFallback(VueComponentAccessor.hostelworldStore())
      const viewModel: VuexStoreViewModel | undefined = store?._vm
      if (!viewModel || viewModel.isPropertiesFilterInstalled) return
      viewModel.isPropertiesFilterInstalled = true

      this.filterState ??= this.reactiveFilterState(viewModel)

      for (const getterName of this.filteredPropertiesGetters) {
        this.hijackStoreGetter(viewModel, getterName)
      }
    }

    return VuexDataHook.onRouteChanged(
      hijackFilteredProperties.bind(this)
    )
  }

  public static async loadAllForCity (
    cityId: string,
    availablePropertyIds: number[],
    callback: (properties: Property[]) => void
  ): Promise<void> {
    const store: VuexStore | undefined = await promiseFallback(VueComponentAccessor.hostelworldStore())
    if (!store) return

    const service: Awaited<ReturnType<VuexStore['$services']['search']>> = await store.$services.search()
    const { properties } = await service.search(cityId, null, null, 1, {})
    const cityProperties: Property[] = [...properties]

    if (!await promiseFallback(waitForElement('.property-card .property-card-container'))) return

    const loaded: Property[] = store.state.search.properties
    const loadedPropertyIds: number[] = pluck(loaded, 'id')

    const allProperties: Property[] = [
      ...loaded,
      ...cityProperties.filter(property => !loadedPropertyIds.includes(property.id))
    ]

    await store.commit('search/setProperties', allProperties)

    callback(
      cityProperties.filter(property => !availablePropertyIds.includes(property.id))
    )
  }

  public static applyPropertyFilter (predicate: PropertyFilterPredicate): void {
    this.filterPredicate = predicate

    void this.triggerFilterChange()
  }

  public static removePropertyFilter (): void {
    this.filterPredicate = null

    void this.triggerFilterChange()
  }

  public static async refreshProperties (): Promise<void> {
    if (this.filterPredicate && this.filterState) {
      this.filterState.version++

      return
    }

    const component: VuePropertyListComponent | undefined = await promiseFallback(
      VueComponentAccessor.propertyListComponent()
    )
    if (!component) return

    const computedWatchers: VuePropertyListComponent['_computedWatchers'] = component._computedWatchers
    if (computedWatchers) {
      for (const watcher of Object.values(computedWatchers)) {
        watcher.dirty = true
      }
    }

    component.$forceUpdate()
  }

  private static reactiveFilterState (viewModel: VuexStoreViewModel): FilterState {
    const state: FilterState = { version: 1 }
    viewModel.$options._base.util.defineReactive(state, 'version', 1)

    return state
  }

  private static hijackStoreGetter (viewModel: VuexStoreViewModel, getterName: string): void {
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(viewModel, getterName)
    if (!descriptor?.get) return

    Object.defineProperty(viewModel, getterName, {
      configurable: true,
      enumerable: true,
      get: (): Property[] => {
        void this.filterState?.version
        const original: Property[] = descriptor.get!.call(viewModel) ?? []

        if (!this.filterPredicate) return original

        return original.filter(
          (entry: Property) => this.filterPredicate!(entry.id)
        )
      },
      set: descriptor.set
        ? (value: unknown) => descriptor.set!.call(viewModel, value)
        : undefined
    })
  }

  private static async triggerFilterChange (): Promise<void> {
    if (!this.filterState) return

    const store: VuexStore | undefined = await promiseFallback(VueComponentAccessor.hostelworldStore())
    if (store) {
      void store.commit('search/setPage', 1)
    }

    this.filterState.version++
  }
}
