import type { BookedCountry } from 'DTOs/BookedCountry'
import { promiseFallback, waitForElement } from 'Utils'

type Avatar = {
  flag: string,
  name: string,
  picture: string
}

type VuePropertyCardComponent = HTMLElement & {
  __vue__: {
    stayingAvatars: {
      title?: string,
      avatarLimit: number,
      avatarList: Avatar[]
    }
  }
}

export class PropertyCardComponentPatcher {
  public static async injectBookedCountries (property: Element, countries: BookedCountry[]): Promise<void> {
    const component: VuePropertyCardComponent | undefined = <VuePropertyCardComponent>
      await promiseFallback(waitForElement('.nuxt-link >a', 10 * 1000, property))

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

    component.__vue__.stayingAvatars = {
      avatarLimit: 999,
      avatarList: avatars
    }
  }
}
