import type { BookedCountry } from 'DTOs/BookedCountry'
import { emptyFunction, promiseFallback, waitForElement } from 'Utils'

type Avatar = {
  flag: string,
  name: string,
  picture: string
}

type StayingAvatars = {
  title?: string,
  avatarLimit: number,
  avatarList: Avatar[]
}

type VuePropertyCardComponent = HTMLElement & {
  __vue__?: {
    stayingAvatars: StayingAvatars
  }
}

export class PropertyCardComponentPatcher {
  public static async injectBookedCountries (property: Element, countries: BookedCountry[]): Promise<void> {
    const component: VuePropertyCardComponent | undefined = <VuePropertyCardComponent>
      await promiseFallback(waitForElement('.nuxt-link >a', 10 * 1000, property))

    if (!component?.__vue__ || !countries.length) return

    const avatars: Avatar[] = countries
      .sort((a: BookedCountry, b: BookedCountry) => b.getCount() - a.getCount())
      .reduce(
        (carry: Avatar[], country: BookedCountry) => {
          const guests: string = country.getCount() === 1 ? '1 person is' : `${country.getCount()} people are`

          carry.push({
            flag: `https://dummyimage.com/50x50/fff/000.jpg&text=${country.getCount()}`,
            name: `${guests} coming from ${country.getName()}.`,
            picture: `https://a.hwstatic.com/hw/flags/${country.getCode()}.svg`
          })

          return carry
        },
        []
      )

    const staying: StayingAvatars = {
      avatarLimit: 999,
      avatarList: avatars
    }

    component.__vue__.stayingAvatars = staying
    Object.defineProperty(component.__vue__, 'stayingAvatars', {
      configurable: true,
      get: () => staying,
      set: emptyFunction
    })
  }
}
