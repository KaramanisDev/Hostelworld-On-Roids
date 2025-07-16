import type { Property } from 'Types/HostelworldSearch'
import { VuexDataHook } from 'Services/Hostelworld/VuexDataHook'
import { emptyFunction, pluck, promiseFallback, waitForElement, waitForProperty } from 'Utils'

type VuePropertyListComponent = {
  propertiesPerPage: number
  displayFeaturedProperties: boolean
}

type HostelworldSearchServiceResult = {
  properties: Property[]
}

interface HostelworldSearchService {
  search (
    type: 'New Search Page',
    cityId: number,
    from: string,
    to: string,
    showRooms: boolean
  ): Promise<HostelworldSearchServiceResult>
}

type HostelworldState = {
  search: {
    city: number | null,
    properties: Property[]
  }
}

type VuexStoreCommit = (type: string, payload: unknown) => Promise<void>

type VuexStore = {
  state: HostelworldState,
  commit: VuexStoreCommit,
  $services: {
    search: () => Promise<HostelworldSearchService>
  }
}

export class SearchPropertyListComponentPatcher {
  public static async disablePagination (): Promise<void> {
    const showAllPropertiesInSearch: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(this.propertyListComponent())
      if (!component) return

      const maxPossiblePropertiesFromRequest: number = 1100
      Object.defineProperty(component, 'propertiesPerPage', {
        configurable: true,
        get: () => maxPossiblePropertiesFromRequest,
        set: () => emptyFunction
      })
    }

    return VuexDataHook.onRouteChanged(
      showAllPropertiesInSearch.bind(this)
    )
  }

  public static async disableFeatured (): Promise<void> {
    const disableFeaturedProperties: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(this.propertyListComponent())
      if (!component) return

      const displayFeaturedProperties: boolean = false
      Object.defineProperty(component, 'displayFeaturedProperties', {
        configurable: true,
        get: () => displayFeaturedProperties,
        set: () => emptyFunction
      })
    }

    return VuexDataHook.onRouteChanged(
      disableFeaturedProperties.bind(this)
    )
  }

  public static async loadAllForCity (cityId: string): Promise<void> {
    const store: VuexStore | undefined = await promiseFallback(this.hostelworldStore())
    if (!store) return

    const service: HostelworldSearchService = await store.$services.search()
    const { properties } = await service.search('New Search Page', Number(cityId), '1943-04-19', '1943-04-20', true)

    await waitForElement('.property-card .property-card-container')

    const loaded: Property[] = store.state.search.properties
    const loadedPropertyIds: number[] = pluck(store.state.search.properties, 'id')

    const unavailable: Property[] = [...properties].filter(property => !loadedPropertyIds.includes(property.id))
    const allProperties: Property[] = [
      ...loaded,
      ...unavailable
    ]

    await store.commit('search/setProperties', allProperties)
  }

  private static async hostelworldStore (): Promise<VuexStore> {
    return await waitForProperty(window, '$nuxt.$store', 60 * 1000)
  }

  private static async propertyListComponent (): Promise<VuePropertyListComponent> {
    const propertyListElement: HTMLElement = await waitForElement('.search .property-list >div', 60 * 1000)

    return waitForProperty(propertyListElement, '__vue__', 60 * 1000)
  }
}
