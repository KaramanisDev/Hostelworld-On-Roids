import type { Property } from 'Types/HostelworldSearch'
import type { BookedCountry } from 'DTOs/BookedCountry'
import { HostelworldDataHook } from 'Services/HostelworldDataHook'
import { emptyFunction, pluck, promiseFallback, waitForElement, waitForProperty } from 'Utils'

type VuePropertyListComponent = {
  propertiesPerPage: number
  displayFeaturedProperties: boolean
}

type Avatar = {
  flag: string,
  name: string,
  picture: string
}

type Booked = {
  title?: string,
  propertyId: number,
  avatarLimit: number,
  avatarList: Avatar[]
}

type HostelworldSearchServiceResult = {
  properties: Property[]
}

interface HostelworldSearchService {
  search (type: 'New Search Page', cityId: number, from: string, to: string, showRooms: boolean): Promise<HostelworldSearchServiceResult>
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

type VueSearchComponent = {
  $store: VuexStore,
  properties: Property[],
  usersWhoBookedAvatars: Booked[]
}

export class HostelworldDataManipulator {
  public static async showMaxPropertiesInSearch (): Promise<void> {
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

    return HostelworldDataHook.onRouteLoad(
      showAllPropertiesInSearch.bind(this)
    )
  }

  public static async hideFeaturedProperties (): Promise<void> {
    const hideFeaturedProperties: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(this.propertyListComponent())
      if (!component) return

      const displayFeaturedProperties: boolean = false
      Object.defineProperty(component, 'displayFeaturedProperties', {
        configurable: true,
        get: () => displayFeaturedProperties,
        set: () => emptyFunction
      })
    }

    return HostelworldDataHook.onRouteLoad(
      hideFeaturedProperties.bind(this)
    )
  }

  public static async setPropertyBookingsOnSearch (property: string, countries: BookedCountry[]): Promise<void> {
    const component: VueSearchComponent | undefined = await promiseFallback(this.searchComponent())
    if (!component || !countries.length) return

    const avatars: Avatar[] = countries
      .sort((a: BookedCountry, b: BookedCountry) => b.getCount() - a.getCount())
      .reduce(
        (carry: Avatar[], country: BookedCountry) => {
          carry.push({
            flag: `https://dummyimage.com/50x50/fff/000.jpg&text=${country.getCount()}`,
            name: `${country.getCount()} people are coming from ${country.getName()}.`,
            picture: `https://a.hwstatic.com/hw/flags/${country.getCode()}.svg`
          })

          return carry
        },
        []
      )

    const existingBookingIndex: number = component.usersWhoBookedAvatars.findIndex(booked => booked.propertyId === Number(property))
    if (existingBookingIndex !== -1) component.usersWhoBookedAvatars.splice(existingBookingIndex, 1)

    component.usersWhoBookedAvatars.push({
      avatarLimit: 999,
      avatarList: avatars,
      propertyId: Number(property)
    })
  }

  public static async displayAllProperties (cityId: string): Promise<void> {
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
    const propertyListElement: HTMLElement = await waitForElement('.search .search-results .search-results .content .search-results div[page]', 60 * 1000)

    return waitForProperty(propertyListElement, '__vue__', 60 * 1000)
  }

  private static async searchComponent (): Promise<VueSearchComponent> {
    await waitForElement('.property-card .property-card-container', 60 * 1000)

    const searchElement: HTMLElement = await waitForElement('.search', 60 * 1000)

    return waitForProperty(searchElement, '__vue__', 60 * 1000)
  }
}
