import type { Property } from 'Types/HostelworldSearch'
import { VuexDataHook } from 'Services/Hostelworld/VuexDataHook'
import { VueComponentAccessor } from 'Services/Hostelworld/VueComponentAccessor'
import type {
  VuePropertyListComponent,
  VueSearchPageComponent,
  VuexStore
} from 'Services/Hostelworld/VueComponentAccessor'
import { emptyFunction, pluck, promiseFallback, waitForElement } from 'Utils'

export type PropertyFilterPredicate = (propertyId: number) => boolean

export class SearchPropertyListComponentPatcher {
  private static filterPredicate: PropertyFilterPredicate | null = null

  public static async disablePagination (): Promise<void> {
    const showAllPropertiesInSearch: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(
        VueComponentAccessor.propertyListComponent()
      )
      if (!component) return

      const maxPossiblePropertiesFromRequest: number = 1100
      Object.defineProperty(component, 'propertiesPerPage', {
        configurable: true,
        get: () => maxPossiblePropertiesFromRequest,
        set: emptyFunction
      })
    }

    return VuexDataHook.onRouteChanged(
      showAllPropertiesInSearch.bind(this)
    )
  }

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
      const component: VuePropertyListComponent | undefined = await promiseFallback(
        VueComponentAccessor.propertyListComponent()
      )
      if (!component) return

      this.setReactiveTrigger(component)
      this.hijackPropertyGetter(component, 'filteredProperties')
      this.hijackPropertyGetter(component, 'filteredHWProperties')
      this.observePropertyGetter(component, 'displayedProperties')
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

    await waitForElement('.property-card .property-card-container')

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
    const component: VuePropertyListComponent | undefined = await promiseFallback(
      VueComponentAccessor.propertyListComponent()
    )
    if (!component) return

    if (this.filterPredicate && component._filterVersion) {
      component._filterVersion++

      return
    }

    const computedWatchers: VuePropertyListComponent['_computedWatchers'] = component._computedWatchers
    if (computedWatchers) {
      for (const watcher of Object.values(computedWatchers)) {
        watcher.dirty = true
      }
    }

    component.$forceUpdate()
  }

  private static setReactiveTrigger (component: VuePropertyListComponent): void {
    component.$options._base.util.defineReactive(component, '_filterVersion', 1)
  }

  private static hijackPropertyGetter (component: VuePropertyListComponent, propertyName: string): void {
    const descriptor: PropertyDescriptor | undefined = this.capturedDescriptor(component, propertyName)
    if (!descriptor?.get) return

    Object.defineProperty(component, propertyName, {
      configurable: true,
      enumerable: true,
      get: (): Property[] => {
        void component._filterVersion
        const original: Property[] = descriptor.get!.call(component) ?? []

        if (!this.filterPredicate) return original

        return original.filter(
          (entry: Property) => this.filterPredicate!(entry.id)
        )
      },
      set: descriptor.set
        ? (value: unknown) => descriptor.set!.call(component, value)
        : undefined
    })
  }

  private static observePropertyGetter (component: VuePropertyListComponent, propertyName: string): void {
    const descriptor: PropertyDescriptor | undefined = this.capturedDescriptor(component, propertyName)
    if (!descriptor?.get) return

    Object.defineProperty(component, propertyName, {
      configurable: true,
      enumerable: true,
      get: (): Property[] => {
        void component._filterVersion

        return descriptor.get!.call(component) ?? []
      },
      set: descriptor.set
        ? (value: unknown) => descriptor.set!.call(component, value)
        : undefined
    })
  }

  private static capturedDescriptor (
    component: VuePropertyListComponent, propertyName: string
  ): PropertyDescriptor | undefined {
    return Object.getOwnPropertyDescriptor(component, propertyName) ??
      Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(component), propertyName)
  }

  private static async triggerFilterChange (): Promise<void> {
    const component: VuePropertyListComponent | undefined = await promiseFallback(
      VueComponentAccessor.propertyListComponent()
    )
    if (!component || !component._filterVersion) return

    const store: VuexStore | undefined = await promiseFallback(VueComponentAccessor.hostelworldStore())
    if (store) {
      void store.commit('search/setPage', 1)
    }

    component._filterVersion++
  }
}
