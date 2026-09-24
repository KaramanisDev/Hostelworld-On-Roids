import type { Property } from 'Types/HostelworldSearch'
import { waitFor, waitForElement, waitForProperty } from 'Utils'

type VueConstructor = {
  util: {
    defineReactive: (object: object, key: string, value: unknown) => void
  }
}

type VueComputedWatcher = {
  dirty: boolean
}

type HostelworldSearchServiceResult = {
  properties: Property[]
  location: unknown
}

interface HostelworldSearchService {
  search (
    cityId: string,
    fromDate: string | null,
    toDate: string | null,
    guests: number,
    options: Record<string, unknown>
  ): Promise<HostelworldSearchServiceResult>
}

export type HostelworldPropertyDetails = {
  id: string
  name: string
  rating: {
    total: number
  } | null
}

type HostelworldState = {
  search: {
    city: number | null
    properties: Property[]
  }
  property: {
    property: HostelworldPropertyDetails | null
  }
}

export type VueSearchPageComponent = {
  isCityEnabled3PI?: boolean
  reset3PIState?: () => void
}

export type VuePropertyListComponent = {
  properties: Property[]
  filteredProperties: Property[]
  filteredHWProperties: Property[]
  displayFeaturedProperties: boolean
  displayedProperties: Property[]
  _computedWatchers?: Record<string, VueComputedWatcher>
  isDisplayedPropertiesWatched?: boolean
  $watch: <T>(property: string, callback: (value: T) => void) => void
  $nextTick: (callback: () => void) => void
  $forceUpdate: () => void
  $parent: VueSearchPageComponent
}

export type VuexStoreViewModel = {
  isPropertiesFilterInstalled?: boolean
  $options: {
    _base: VueConstructor
  }
}

export type VuexStore = {
  state: HostelworldState
  commit: (type: string, payload: unknown) => Promise<void>
  $services: {
    search: () => Promise<HostelworldSearchService>
  }
  _vm: VuexStoreViewModel
}

export class VueComponentAccessor {
  public static async propertyListComponent (): Promise<VuePropertyListComponent> {
    const propertyListElement: HTMLElement = await waitForElement('.search .property-list >div', 60 * 1000)

    return waitForProperty(propertyListElement, '__vue__', 60 * 1000)
  }

  public static async hostelworldStore (): Promise<VuexStore> {
    return await waitForProperty(window, '$nuxt.$store', 60 * 1000)
  }

  public static async propertyDetails (propertyId: number): Promise<HostelworldPropertyDetails> {
    const store: VuexStore = await this.hostelworldStore()

    return waitFor(
      (): HostelworldPropertyDetails | undefined => {
        const details: HostelworldPropertyDetails | null = store.state.property.property

        return details && Number(details.id) === propertyId ? details : undefined
      },
      30 * 1000,
      `Details of property ${propertyId} are not available within the specified time.`
    )
  }
}
