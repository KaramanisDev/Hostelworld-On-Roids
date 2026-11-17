import type { Property } from 'DTOs/Property'
import type { PropertyPage } from 'DTOs/PropertyPage'
import type { Session } from 'DTOs/Session'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import type { BookedCountry } from 'DTOs/BookedCountry'
import type { CollectedMetric } from 'Services/PropertyMetrics'
import { PropertyPageArea } from 'Services/Hostelworld/Page'
import { PropertyCardViewDTOFactory } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyInsightsView } from 'UI/SolidJS/PropertyInsights/PropertyInsightsView'
import { PropertyInsightsLabels, PropertyInsightsViewDTOFactory } from './ViewDTOs'

export class PropertyInsightsRenderer {
  private static readonly sectionClassName: string = 'hor-property-insights'
  private static readonly tabClassName: string = 'hor-insights-tab'

  private static section: HTMLElement | null = null
  private static readonly view: PropertyInsightsView = new PropertyInsightsView()

  public static render (page: PropertyPage): void {
    this.section ??= this.createSection()

    this.view.mount(this.section, PropertyInsightsViewDTOFactory.loading(page.getId()))

    PropertyPageArea.placeSection(this.section, { label: PropertyInsightsLabels.tab, className: this.tabClassName })
  }

  public static renderWithData (property: Property, session: Session): void {
    if (!session.isDisplayedStay(property.getId(), property.getStay())) return

    this.view.update(PropertyInsightsViewDTOFactory.loaded(property))
  }

  public static updateMetric (collected: CollectedMetric, session: Session): void {
    switch (collected.metric) {
      case 'reviews':
        if (!session.isDisplayedProperty(collected.propertyId)) return

        return this.updateReviewMetrics(collected.reviewMetrics)
      case 'availability':
        if (!session.isDisplayedStay(collected.propertyId, collected.stay)) return

        return this.updateAvailabilityMetrics(collected.availabilityMetrics)
      case 'countries':
        if (!session.isDisplayedStay(collected.propertyId, collected.stay)) return

        return this.updateCountries(collected.bookedCountries)
    }
  }

  public static showDisconnected (): void {
    this.view.showDisconnected()
  }

  public static dispose (): void {
    this.view.dispose()
    PropertyPageArea.removeSection()

    this.section = null
  }

  private static updateReviewMetrics (metrics: ReviewMetrics | null): void {
    this.view.update(PropertyCardViewDTOFactory.reviewRows(metrics))
  }

  private static updateAvailabilityMetrics (metrics: AvailabilityMetrics | null): void {
    this.view.update({
      availability: PropertyCardViewDTOFactory.availabilityRow(metrics)
    })
  }

  private static updateCountries (bookedCountries: BookedCountry[]): void {
    this.view.update({
      countries: PropertyInsightsViewDTOFactory.countries(bookedCountries)
    })
  }

  private static createSection (): HTMLElement {
    const section: HTMLElement = document.createElement('section')
    section.className = this.sectionClassName

    return section
  }
}
