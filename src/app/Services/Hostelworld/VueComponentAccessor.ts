import type { Property } from 'Types/HostelworldSearch'
import { waitForElement, waitForProperty } from 'Utils'

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

type HostelworldState = {
  search: {
    city: number | null
    properties: Property[]
  }
}

export type VuePropertyListComponent = {
  properties: Property[]
  filteredProperties: Property[]
  filteredHWProperties: Property[]
  propertiesPerPage: number
  displayFeaturedProperties: boolean
  displayedProperties: Property[]
  _filterVersion?: number
  _computedWatchers?: Record<string, VueComputedWatcher>
  isDisplayedPropertiesWatched?: boolean
  $watch: (property: string, callback: (properties: Property[]) => void) => void
  $forceUpdate: () => void
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
}

export class VueComponentAccessor {
  public static async propertyListComponent (): Promise<VuePropertyListComponent> {
    const propertyListElement: HTMLElement = await waitForElement('.search .property-list >div', 60 * 1000)

    return waitForProperty(propertyListElement, '__vue__', 60 * 1000)
  }

  public static async hostelworldStore (): Promise<VuexStore> {
    return await waitForProperty(window, '$nuxt.$store', 60 * 1000)
  }
}
