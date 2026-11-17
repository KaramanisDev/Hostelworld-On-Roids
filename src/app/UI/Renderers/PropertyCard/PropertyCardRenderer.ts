import type { Property } from 'DTOs/Property'
import type { Stay } from 'DTOs/Stay'
import type { Search } from 'DTOs/Search'
import type { Session } from 'DTOs/Session'
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

  public static async render (propertyId: number, session: Session): Promise<void> {
    const search: Search | undefined = session.getLatestSearch()
    if (!search) return
    if (!await PropertyCardsArea.hasCards()) return
    if (!session.isLatestSearch(search)) return

    const card: HTMLElement | null = PropertyCardsArea.card(propertyId)
    if (!card) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loading(propertyId)
    this.view.mount(card, viewDto)
    this.visibilityTracker.track(card, propertyId)
  }

  public static async renderWithData (property: Property, session: Session): Promise<void> {
    const search: Search | undefined = session.getLatestSearch()
    if (!search || !session.isLatestStay(property.getStay())) return
    if (!await PropertyCardsArea.hasCards()) return
    if (!session.isLatestSearch(search)) return

    const card: HTMLElement | null = PropertyCardsArea.card(property.getId())
    if (!card) return

    const viewDto: PropertyCardViewDTO = PropertyCardViewDTOFactory.loaded(property)
    this.view.mount(card, viewDto)

    const tagsContainer: HTMLElement | null = PropertyCardsArea.tagsContainer(card)
    if (tagsContainer) {
      this.badgeTagsView.mount(tagsContainer, { propertyId: property.getId(), badges: property.getBadges() })
    }

    await this.showBookedCountries(property.getId(), property.getStay(), property.getBookedCountries(), session)
  }

  public static async updateMetric (collected: CollectedMetric, session: Session): Promise<void> {
    switch (collected.metric) {
      case 'reviews':
        return this.updateReviewMetrics(collected.propertyId, collected.reviewMetrics)
      case 'availability':
        if (!session.isLatestStay(collected.stay)) return

        return this.updateAvailabilityMetrics(collected.propertyId, collected.availabilityMetrics)
      case 'countries':
        return this.showBookedCountries(collected.propertyId, collected.stay, collected.bookedCountries, session)
    }
  }

  public static clear (): void {
    this.view.dispose()
    this.badgeTagsView.dispose()
    PropertyCardsArea.clearBookedCountries()
  }

  public static showDisconnected (): void {
    this.view.showDisconnected()
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

  private static async showBookedCountries (
    propertyId: number,
    stay: Stay,
    countries: BookedCountry[],
    session: Session
  ): Promise<void> {
    const search: Search | undefined = session.getLatestSearch()
    if (!search || !session.isLatestStay(stay)) return
    if (!await PropertyCardsArea.hasCardComponent(propertyId)) return
    if (!session.isLatestSearch(search)) return

    PropertyCardsArea.showBookedCountries(propertyId, countries)
  }
}
