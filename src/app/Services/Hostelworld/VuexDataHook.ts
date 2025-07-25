import type { Property } from 'Types/HostelworldSearch'
import { promiseFallback, waitForElement, waitForProperty } from 'Utils'

type VuexRouter = {
  onReady: Function
  afterEach: Function
}

type VuePropertyListComponent = {
  $watch: Function
  displayedProperties: Property[]
  isDisplayedPropertiesWatched?: boolean
}

export class VuexDataHook {
  public static async onPropertiesDisplayed (callback: (propertyIds: number[]) => void): Promise<void> {
    const onDisplayedPropertiesUpdate: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(this.propertyListComponent())
      if (!component) return

      if (component.isDisplayedPropertiesWatched) return
      component.isDisplayedPropertiesWatched = true

      component.$watch('displayedProperties', (properties: Property[]) => {
        if (!properties[0]) return

        callback(
          properties.map(property => property.id)
        )
      })
    }

    return this.onRouteChanged(
      onDisplayedPropertiesUpdate.bind(this)
    )
  }

  public static async onRouteChanged (callback: () => void | Promise<void>): Promise<void> {
    const router: VuexRouter = await waitForProperty(window, '$nuxt.$router', 60 * 1000)

    router.onReady(callback.bind(this))
    router.afterEach(callback.bind(this))
  }

  private static async propertyListComponent (): Promise<VuePropertyListComponent> {
    const propertyListElement: HTMLElement = await waitForElement('.search .property-list >div', 60 * 1000)

    return waitForProperty(propertyListElement, '__vue__', 60 * 1000)
  }
}
