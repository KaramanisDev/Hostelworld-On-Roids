import { VueComponentAccessor } from 'Services/Hostelworld/VueComponentAccessor'
import type { VuePropertyListComponent } from 'Services/Hostelworld/VueComponentAccessor'
import { promiseFallback, waitForProperty } from 'Utils'

type VuexRouter = {
  onReady: (callback: () => void) => void
  afterEach: (callback: () => void) => void
}

export class VuexDataHook {
  public static async onPropertiesDisplayed (callback: (propertyIds: number[]) => void): Promise<void> {
    const onDisplayedPropertiesUpdate: () => Promise<void> = async (): Promise<void> => {
      const component: VuePropertyListComponent | undefined = await promiseFallback(
        VueComponentAccessor.propertyListComponent()
      )
      if (!component) return

      if (component.isDisplayedPropertiesWatched) return
      component.isDisplayedPropertiesWatched = true

      component.$watch('displayedProperties', (properties) => {
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
}
