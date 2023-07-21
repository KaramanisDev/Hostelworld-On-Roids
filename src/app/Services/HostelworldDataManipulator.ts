import type { Property as AvailableProperty } from 'Types/HostelworldSearchProperties'
import { HostelworldDataHook } from 'Services/HostelworldDataHook'
import { emptyFunction, promiseFallback, waitForElement, waitForProperty } from 'Utils'

type VuePropertyListComponent = {
  propertiesPerPage: number
  displayFeaturedProperties: boolean
}

type VueSearchComponent = {
  properties: AvailableProperty[]
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

  private static async propertyListComponent (): Promise<VuePropertyListComponent> {
    const propertyListElement: HTMLElement = await waitForElement('.search .search-results .search-results .content .search-results div[page]', 60 * 1000)

    return waitForProperty(propertyListElement, '__vue__', 60 * 1000)
  }

  private static async searchComponent (): Promise<VueSearchComponent> {
    const searchElement: HTMLElement = await waitForElement('.search', 60 * 1000)

    return waitForProperty(searchElement, '__vue__', 60 * 1000)
  }
}
