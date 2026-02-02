import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { PropertyBadge } from 'Services/PropertyBadgeService'
import type { ViewAdapterInterface } from 'UI/ViewAdapterInterface'
import { PropertyCardView } from 'UI/SolidJS/PropertyCard/PropertyCardView'
import type { PropertyCardViewDTO } from './ViewDTOs'
import { PropertyCardViewDTOFactory } from './ViewDTOs'
import { waitForElement } from 'Utils'
import { PropertyCardComponentPatcher } from 'Services/Hostelworld/Patchers/PropertyCardComponentPatcher'
import { BadgeTagsView } from 'UI/SolidJS/BadgeTags/BadgeTagsView'
import { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'

export class PropertyCardRenderer {
  private static readonly view: ViewAdapterInterface<PropertyCardViewDTO> = new PropertyCardView()
  private static readonly badgeTagsView: BadgeTagsView = new BadgeTagsView()

  public static async render (propertyId: number, propertyName?: string): Promise<void> {
    await waitForElement('.property-card .property-card-container')

    const container: HTMLElement | null = this.findContainer(propertyId, propertyName)
    if (!container) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loading(propertyId)
    this.view.mount(container, viewDto)
  }

  public static async renderWithData (property: Property, badges: PropertyBadge[]): Promise<void> {
    await waitForElement('.property-card .property-card-container')

    const container: HTMLElement | null = this.findContainer(property.getId(), property.getName())
    if (!container) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loaded(property)
    this.view.mount(container, viewDto)

    await PropertyCardComponentPatcher.injectBookedCountries(
      container,
      property.getBookedCountries()
    )

    this.badgeTagsView.mount(container, { propertyId: property.getId(), badges })
  }

  public static updateReviewMetrics (propertyId: number, metrics: ReviewMetrics): void {
    this.view.update({
      propertyId,
      reviews: PropertyCardViewDTOFactory.reviewsRow(metrics),
      ageGroups: PropertyCardViewDTOFactory.ageGroupsRow(metrics)
    })
  }

  public static updateAvailabilityMetrics (propertyId: number, metrics: AvailabilityMetrics): void {
    this.view.update({
      propertyId,
      availability: PropertyCardViewDTOFactory.availabilityRow(metrics)
    })
  }

  public static async updateCountries (
    propertyId: number,
    propertyName: string,
    countries: PropertyGuestsCountries
  ): Promise<void> {
    const container: HTMLElement | null = this.findContainer(propertyId, propertyName)
    if (!container) return

    const bookedCountries: BookedCountry[] = countries.map(country => new BookedCountry(country))
    await PropertyCardComponentPatcher.injectBookedCountries(container, bookedCountries)
  }

  private static findContainer (propertyId: number, propertyName?: string): HTMLElement | null {
    const propertyCards: NodeListOf<Element> = document.querySelectorAll('.property-card')

    for (const card of propertyCards) {
      const containsId: boolean = card.innerHTML.includes(String(propertyId))
      if (!containsId) continue

      if (!propertyName) return card as HTMLElement

      const containsName: boolean = card.innerHTML.includes(this.htmlEncode(propertyName))
      if (containsName) return card as HTMLElement
    }

    return null
  }

  private static htmlEncode (value: string): string {
    const element: HTMLDivElement = document.createElement('div')
    element.textContent = value

    return element.innerHTML
  }
}
