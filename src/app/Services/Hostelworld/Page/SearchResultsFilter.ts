import type { Property } from 'Types/HostelworldSearch'
import { promiseFallback } from 'Utils'
import { NuxtApp } from './NuxtApp'
import type { VueDependency, VuexStore, VuexStoreViewModel } from './HostelworldVueTypes'

type PropertyFilterPredicate = (propertyId: number) => boolean

type FilterState = {
  version: number
}

export class SearchResultsFilter {
  private static readonly filteredPropertiesGetters: string[] = [
    'search/filteredProperties',
    'search/filteredHWProperties'
  ]

  private static predicate: PropertyFilterPredicate | null = null
  private static storeViewModel: VuexStoreViewModel | null = null
  private static filterState: FilterState | null = null

  public static install (): Promise<void> {
    return NuxtApp.onRouteChanged(async (): Promise<void> => {
      const store: VuexStore | undefined = await promiseFallback(NuxtApp.store())
      const viewModel: VuexStoreViewModel | undefined = store?._vm
      if (!viewModel || viewModel.isPropertiesFilterInstalled) return
      viewModel.isPropertiesFilterInstalled = true

      this.storeViewModel = viewModel
      this.filterState ??= this.reactiveFilterState(viewModel)

      for (const getterName of this.filteredPropertiesGetters) {
        this.hijackStoreGetter(viewModel, getterName)
      }
    })
  }

  public static filterBy (predicate: PropertyFilterPredicate): void {
    this.predicate = predicate

    void this.triggerFilterChange()
  }

  public static clear (): void {
    this.predicate = null

    void this.triggerFilterChange()
  }

  public static isFiltering (): boolean {
    return Boolean(this.filterState?.version) && this.predicate !== null
  }

  public static refresh (): void {
    if (!this.filterState) return

    this.filterState.version++
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
        const original: Property[] = descriptor.get!.call(viewModel) ?? []

        if (!this.isFiltering()) return original

        return original.filter(
          (entry: Property) => this.predicate!(entry.id)
        )
      },
      set: descriptor.set
        ? (value: unknown) => descriptor.set!.call(viewModel, value)
        : undefined
    })
  }

  private static async triggerFilterChange (): Promise<void> {
    if (!this.storeViewModel) return

    const store: VuexStore | undefined = await promiseFallback(NuxtApp.store())
    if (store) {
      void store.commit('search/setPage', 1)
    }

    this.invalidateFilteredProperties(this.storeViewModel)
  }

  private static invalidateFilteredProperties (viewModel: VuexStoreViewModel): void {
    for (const getterName of this.filteredPropertiesGetters) {
      const dependencies: VueDependency[] = viewModel._computedWatchers?.[getterName]?.deps ?? []

      for (const dependency of [...dependencies]) {
        dependency.notify()
      }
    }
  }
}
