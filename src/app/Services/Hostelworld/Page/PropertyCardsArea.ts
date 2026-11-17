import type { BookedCountry } from 'DTOs/BookedCountry'
import { promiseFallback, waitForElement } from 'Utils'
import { ReactiveOverride } from './ReactiveOverride'
import type { Avatar, StayingAvatars, VuePropertyCardComponent } from './HostelworldVueTypes'

export class PropertyCardsArea {
  private static readonly cardSelector: string = '.property-card'
  private static readonly cardContainerSelector: string = '.property-card .property-card-container'
  private static readonly propertyLinkSelector: string = 'a[href*="hosteldetails.php"]'
  private static readonly propertyLinkRegex: RegExp = /hosteldetails\.php\/[^/]+\/[^/]+\/(\d+)/
  private static readonly tagsSelector: string = '.tags-container'
  private static readonly cardComponentSelector: string = '.nuxt-link >a'
  private static readonly cardComponentTimeoutInMs: number = 10 * 1000
  private static readonly avatarLimit: number = 999

  public static async hasCards (): Promise<boolean> {
    return Boolean(await promiseFallback(waitForElement(this.cardContainerSelector)))
  }

  public static card (propertyId: number): HTMLElement | null {
    const cards: NodeListOf<HTMLElement> = document.querySelectorAll(this.cardSelector)

    for (const cardElement of cards) {
      if (this.cardPropertyId(cardElement) === propertyId) return cardElement
    }

    return null
  }

  public static tagsContainer (card: HTMLElement): HTMLElement | null {
    return card.querySelector(this.tagsSelector)
  }

  public static async showBookedCountries (card: HTMLElement, countries: BookedCountry[]): Promise<void> {
    const componentElement: HTMLElement | undefined = await promiseFallback(
      waitForElement(this.cardComponentSelector, this.cardComponentTimeoutInMs, card)
    )
    const component: VuePropertyCardComponent | undefined = componentElement?.__vue__ as
      VuePropertyCardComponent | undefined
    if (!component || !countries.length) return

    const staying: StayingAvatars = {
      avatarLimit: this.avatarLimit,
      avatarList: this.avatars(countries)
    }

    component.stayingAvatars = staying
    ReactiveOverride.pin(component, 'stayingAvatars', staying)
  }

  private static cardPropertyId (card: Element): number | null {
    const match: RegExpMatchArray | null | undefined = card
      .querySelector(this.propertyLinkSelector)
      ?.getAttribute('href')
      ?.match(this.propertyLinkRegex)

    return match ? Number(match[1]) : null
  }

  private static avatars (countries: BookedCountry[]): Avatar[] {
    return [...countries]
      .sort((first: BookedCountry, second: BookedCountry) => second.getCount() - first.getCount())
      .map((country: BookedCountry): Avatar => ({
        flag: `https://dummyimage.com/50x50/fff/000.jpg&text=${country.getCount()}`,
        name: country.getGuestsLabel(),
        picture: country.getFlag()
      }))
  }
}
