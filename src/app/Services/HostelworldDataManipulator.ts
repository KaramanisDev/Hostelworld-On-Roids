import { delay, promiseFallback, waitForElement, waitForProperty } from 'Utils'
import type { Property as AvailableProperty } from 'Types/HostelworldSearchProperties'
import type { Property as UnavailableProperty } from 'Types/HostelworldSearchUnavailableProperties'

type VuexRouter = {
  onReady: Function
  afterEach: Function
}

type VuePropertyListComponent = {
  propertiesPerPage: number
  isSellingOutFast: boolean
  displayFeaturedProperties: boolean
}


type VueSearchComponent = {
  properties: AvailableProperty[]
  unavailableProperties: UnavailableProperty[]
  getUsersWhoBooked: (propertyIds: number[]) => Promise<void>
  getUnavailableProperties: (properties: AvailableProperty[]) => Promise<void>
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
        set: () => {}
      })
    }

    return this.onRouteLoad(showAllPropertiesInSearch)
  }

  public static async hideSellingOutFastLabel (): Promise<void> {
    const hideSellingOutLabel: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(this.propertyListComponent())
      if (!component) return

      const isSellingOutFast: boolean = false
      Object.defineProperty(component, 'isSellingOutFast', {
        configurable: true,
        get: () => isSellingOutFast,
        set: () => {}
      })
    }

    return this.onRouteLoad(hideSellingOutLabel)
  }

  public static async hideFeaturedProperties (): Promise<void> {
    const hideFeaturedProperties: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(this.propertyListComponent())
      if (!component) return

      const displayFeaturedProperties: boolean = false
      Object.defineProperty(component, 'displayFeaturedProperties', {
        configurable: true,
        get: () => displayFeaturedProperties,
        set: () => {}
      })
    }

    return this.onRouteLoad(hideFeaturedProperties)
  }

  public static async showMaxUnavailablePropertiesAndSocialCues (): Promise<void> {
    const showMaxUnavailablePropertiesAndSocialCues: () => Promise<void> = async (): Promise<void> => {
      await delay(2000)

      const propertyCard: HTMLDivElement | undefined = await promiseFallback(
        waitForElement('.property-card .property', 60 * 1000)
      )
      if (!propertyCard) return

      const component: VueSearchComponent | undefined = await promiseFallback(this.searchComponent())
      if (!component) return

      await component.getUnavailableProperties([])

      const propertyIds: number[] = [
        ...component.properties.map(property => property.id),
        ...component.unavailableProperties.map(property => property.id)
      ]

      await component.getUsersWhoBooked(propertyIds)
    }

    return this.onRouteLoad(showMaxUnavailablePropertiesAndSocialCues)
  }

  private static async onRouteLoad (callback: () => void | Promise<void>): Promise<void> {
    const router: VuexRouter = await waitForProperty(window, '$nuxt.$router', 60 * 1000)

    router.onReady(callback.bind(this))
    router.afterEach(callback.bind(this))
  }

  private static async propertyListComponent (): Promise<VuePropertyListComponent> {
    const propertyListElement: HTMLElement = await waitForElement('.search .page-inner div[page]', 60 * 1000)

    return waitForProperty(propertyListElement, '__vue__', 60 * 1000)
  }

  private static async searchComponent (): Promise<VueSearchComponent> {
    const searchElement: HTMLElement = await waitForElement('.search', 60 * 1000)

    return waitForProperty(searchElement, '__vue__', 60 * 1000)
  }
}
