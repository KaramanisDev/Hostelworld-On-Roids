import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { PropertyCardView } from 'UI/SolidJS/PropertyCard/PropertyCardView'
import type { PropertyCardViewDTO } from './ViewDTOs'
import { PropertyCardViewDTOFactory } from './ViewDTOs'
import { promiseFallback, waitForElement } from 'Utils'
import { PropertyCardComponentPatcher } from 'Services/Hostelworld/Patchers/PropertyCardComponentPatcher'
import { BadgeTagsView } from 'UI/SolidJS/BadgeTags/BadgeTagsView'
import { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

export class PropertyCardRenderer {
  private static readonly view: PropertyCardView = new PropertyCardView()
  private static readonly badgeTagsView: BadgeTagsView = new BadgeTagsView()
  private static readonly propertyLinkRegex: RegExp = /hosteldetails\.php\/[^/]+\/[^/]+\/(\d+)/

  public static async render (propertyId: number): Promise<void> {
    if (!await this.hasPropertyCards()) return

    const container: HTMLElement | null = this.findContainer(propertyId)
    if (!container) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loading(propertyId)
    this.view.mount(container, viewDto)
  }

  public static async renderWithData (property: Property): Promise<void> {
    if (!await this.hasPropertyCards()) return

    const container: HTMLElement | null = this.findContainer(property.getId())
    if (!container) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loaded(property)
    this.view.mount(container, viewDto)

    await PropertyCardComponentPatcher.injectBookedCountries(
      container,
      property.getBookedCountries()
    )

    this.badgeTagsView.mount(container, { propertyId: property.getId(), badges: property.getBadges() })
  }

  public static updateReviewMetrics (propertyId: number, metrics: ReviewMetrics): void {
    this.view.update({
      propertyId,
      reviews: PropertyCardViewDTOFactory.reviewsRow(metrics),
      ageGroups: PropertyCardViewDTOFactory.ageGroupsRow(metrics),
      recentRating: PropertyCardViewDTOFactory.recentRatingRow(metrics)
    })
  }

  public static updateAvailabilityMetrics (propertyId: number, metrics: AvailabilityMetrics): void {
    this.view.update({
      propertyId,
      availability: PropertyCardViewDTOFactory.availabilityRow(metrics)
    })
  }

  public static showDisconnected (): void {
    this.view.showDisconnected()
  }

  public static async updateCountries (propertyId: number, countries: PropertyGuestsCountries): Promise<void> {
    const container: HTMLElement | null = this.findContainer(propertyId)
    if (!container) return

    const bookedCountries: BookedCountry[] = countries.map(country => new BookedCountry(country))
    await PropertyCardComponentPatcher.injectBookedCountries(container, bookedCountries)
  }

  private static async hasPropertyCards (): Promise<boolean> {
    return Boolean(await promiseFallback(waitForElement('.property-card .property-card-container')))
  }

  private static findContainer (propertyId: number): HTMLElement | null {
    const propertyCards: NodeListOf<Element> = document.querySelectorAll('.property-card')

    for (const card of propertyCards) {
      if (this.cardPropertyId(card) === propertyId) return card as HTMLElement
    }

    return null
  }

  private static cardPropertyId (card: Element): number | null {
    const match: RegExpMatchArray | null | undefined = card
      .querySelector('a[href*="hosteldetails.php"]')
      ?.getAttribute('href')
      ?.match(this.propertyLinkRegex)

    return match ? Number(match[1]) : null
  }
}
