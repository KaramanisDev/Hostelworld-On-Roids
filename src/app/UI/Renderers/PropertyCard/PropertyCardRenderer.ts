import type { Property } from 'DTOs/Property'
import type { Stay } from 'DTOs/Stay'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { PropertyCardView } from 'UI/SolidJS/PropertyCard/PropertyCardView'
import type { PropertyCardViewDTO } from './ViewDTOs'
import { PropertyCardViewDTOFactory } from './ViewDTOs'
import { PropertyCardsArea } from 'Services/Hostelworld/Page'
import { BadgeTagsView } from 'UI/SolidJS/BadgeTags/BadgeTagsView'
import type { BookedCountry } from 'DTOs/BookedCountry'
import type { CollectedMetric } from 'Services/PropertyMetrics'
import { PropertyCardVisibilityTracker } from './PropertyCardVisibilityTracker'
import { EventBus } from 'Core/EventBus'

export class PropertyCardRenderer {
  private static readonly view: PropertyCardView = new PropertyCardView()
  private static readonly badgeTagsView: BadgeTagsView = new BadgeTagsView()
  private static readonly visibilityTracker: PropertyCardVisibilityTracker = new PropertyCardVisibilityTracker(
    (propertyIds: number[]): void => EventBus.emit('property:cards:visible', propertyIds)
  )

  private static shownStay: Stay | null = null

  public static showCardsFor (stay: Stay | null): void {
    this.shownStay = stay
  }

  public static async render (propertyId: number): Promise<void> {
    if (!await PropertyCardsArea.hasCards()) return

    const card: HTMLElement | null = PropertyCardsArea.card(propertyId)
    if (!card) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loading(propertyId)
    this.view.mount(card, viewDto)
    this.visibilityTracker.track(card, propertyId)
  }

  public static async renderWithData (property: Property): Promise<void> {
    if (!this.isShownStay(property.getStay())) return
    if (!await PropertyCardsArea.hasCards()) return

    const card: HTMLElement | null = PropertyCardsArea.card(property.getId())
    if (!card) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loaded(property)
    this.view.mount(card, viewDto)

    const tagsContainer: HTMLElement | null = PropertyCardsArea.tagsContainer(card)
    if (tagsContainer) {
      this.badgeTagsView.mount(tagsContainer, { propertyId: property.getId(), badges: property.getBadges() })
    }

    await PropertyCardsArea.showBookedCountries(card, property.getBookedCountries())
  }

  public static async updateMetric (collected: CollectedMetric): Promise<void> {
    switch (collected.metric) {
      case 'reviews':
        return this.updateReviewMetrics(collected.propertyId, collected.reviewMetrics)
      case 'availability':
        if (!this.isShownStay(collected.stay)) return

        return this.updateAvailabilityMetrics(collected.propertyId, collected.availabilityMetrics)
      case 'countries':
        if (!this.isShownStay(collected.stay)) return

        return this.updateCountries(collected.propertyId, collected.bookedCountries)
    }
  }

  public static showDisconnected (): void {
    this.view.showDisconnected()
  }

  private static isShownStay (stay: Stay): boolean {
    return Boolean(this.shownStay?.isSameAs(stay))
  }

  private static updateReviewMetrics (propertyId: number, metrics: ReviewMetrics | null): void {
    this.view.update({ propertyId, ...PropertyCardViewDTOFactory.reviewRows(metrics) })
  }

  private static updateAvailabilityMetrics (propertyId: number, metrics: AvailabilityMetrics | null): void {
    this.view.update({
      propertyId,
      availability: PropertyCardViewDTOFactory.availabilityRow(metrics)
    })
  }

  private static async updateCountries (propertyId: number, bookedCountries: BookedCountry[]): Promise<void> {
    const card: HTMLElement | null = PropertyCardsArea.card(propertyId)
    if (!card) return

    await PropertyCardsArea.showBookedCountries(card, bookedCountries)
  }
}
