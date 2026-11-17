import type { Property } from 'DTOs/Property'
import type { PropertyPage } from 'DTOs/PropertyPage'
import type { Stay } from 'DTOs/Stay'
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

  private static propertyId: number | null = null
  private static displayedStay: Stay | null = null
  private static section: HTMLElement | null = null
  private static readonly view: PropertyInsightsView = new PropertyInsightsView()

  public static render (page: PropertyPage): void {
    this.propertyId = page.getId()
    this.displayedStay = page.getStay()
    this.section ??= this.createSection()

    this.view.mount(this.section, PropertyInsightsViewDTOFactory.loading(page.getId()))

    PropertyPageArea.placeSection(this.section, { label: PropertyInsightsLabels.tab, className: this.tabClassName })
  }

  public static renderWithData (property: Property): void {
    if (!this.isDisplayedStay(property.getId(), property.getStay())) return

    this.view.update(PropertyInsightsViewDTOFactory.loaded(property))
  }

  public static updateMetric (collected: CollectedMetric): void {
    switch (collected.metric) {
      case 'reviews':
        return this.updateReviewMetrics(collected.propertyId, collected.reviewMetrics)
      case 'availability':
        return this.updateAvailabilityMetrics(collected.propertyId, collected.stay, collected.availabilityMetrics)
      case 'countries':
        return this.updateCountries(collected.propertyId, collected.stay, collected.bookedCountries)
    }
  }

  public static showDisconnected (): void {
    this.view.showDisconnected()
  }

  public static dispose (): void {
    this.view.dispose()
    PropertyPageArea.removeSection()

    this.section = null
    this.propertyId = null
    this.displayedStay = null
  }

  private static updateReviewMetrics (propertyId: number, metrics: ReviewMetrics | null): void {
    if (propertyId !== this.propertyId) return

    this.view.update(PropertyCardViewDTOFactory.reviewRows(metrics))
  }

  private static updateAvailabilityMetrics (propertyId: number, stay: Stay, metrics: AvailabilityMetrics | null): void {
    if (!this.isDisplayedStay(propertyId, stay)) return

    this.view.update({
      availability: PropertyCardViewDTOFactory.availabilityRow(metrics)
    })
  }

  private static updateCountries (propertyId: number, stay: Stay, bookedCountries: BookedCountry[]): void {
    if (!this.isDisplayedStay(propertyId, stay)) return

    this.view.update({
      countries: PropertyInsightsViewDTOFactory.countries(bookedCountries)
    })
  }

  private static isDisplayedStay (propertyId: number, stay: Stay): boolean {
    return propertyId === this.propertyId && Boolean(this.displayedStay?.isSameAs(stay))
  }

  private static createSection (): HTMLElement {
    const section: HTMLElement = document.createElement('section')
    section.className = this.sectionClassName

    return section
  }
}
