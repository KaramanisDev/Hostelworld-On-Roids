import type { Property } from 'DTOs/Property'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { BookedCountry } from 'DTOs/BookedCountry'
import type { PropertyGuestsCountries } from 'Services/Hostelworld/Api/VisitorsCountryClient'
import { PropertyCardViewDTOFactory } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyInsightsView } from 'UI/SolidJS/PropertyInsights/PropertyInsightsView'
import { PropertyInsightsLabels, PropertyInsightsViewDTOFactory } from './ViewDTOs'

export class PropertyInsightsRenderer {
  private static readonly sectionClassName: string = 'hor-property-insights'
  private static readonly tabClassName: string = 'hor-insights-tab'
  private static readonly anchorSelector: string = '.property-about'
  private static readonly tabListSelector: string = '.nav .tab-list'
  private static readonly previousTabIndex: number = 1

  private static propertyId: number | null = null
  private static section: HTMLElement | null = null
  private static tab: HTMLElement | null = null
  private static observer: MutationObserver | null = null
  private static readonly view: PropertyInsightsView = new PropertyInsightsView()

  public static render (propertyId: number): void {
    this.propertyId = propertyId
    this.section ??= this.createSection()

    this.view.mount(this.section, PropertyInsightsViewDTOFactory.loading(propertyId))

    this.attach()
    this.watchForRemoval()
  }

  public static renderWithData (property: Property): void {
    if (property.getId() !== this.propertyId) return

    this.view.update(PropertyInsightsViewDTOFactory.loaded(property))
  }

  public static updateReviewMetrics (propertyId: number, metrics: ReviewMetrics): void {
    if (propertyId !== this.propertyId) return

    this.view.update({
      reviews: PropertyCardViewDTOFactory.reviewsRow(metrics),
      ageGroups: PropertyCardViewDTOFactory.ageGroupsRow(metrics),
      recentRating: PropertyCardViewDTOFactory.recentRatingRow(metrics)
    })
  }

  public static updateAvailabilityMetrics (propertyId: number, metrics: AvailabilityMetrics): void {
    if (propertyId !== this.propertyId) return

    this.view.update({
      availability: PropertyCardViewDTOFactory.availabilityRow(metrics)
    })
  }

  public static updateCountries (propertyId: number, countries: PropertyGuestsCountries): void {
    if (propertyId !== this.propertyId) return

    const bookedCountries: BookedCountry[] = countries.map(country => new BookedCountry(country))
    this.view.update({
      countries: PropertyInsightsViewDTOFactory.countries(bookedCountries)
    })
  }

  public static dispose (): void {
    this.observer?.disconnect()
    this.view.dispose()
    this.section?.remove()
    this.tab?.remove()

    this.observer = null
    this.section = null
    this.tab = null
    this.propertyId = null
  }

  private static createSection (): HTMLElement {
    const section: HTMLElement = document.createElement('section')
    section.className = this.sectionClassName

    return section
  }

  private static createTab (nativeTab: Element): HTMLElement {
    const tab: HTMLElement = nativeTab.cloneNode(true) as HTMLElement
    tab.classList.add(this.tabClassName)
    tab.addEventListener('click', () => this.section?.scrollIntoView({ behavior: 'smooth' }))

    const label: Node | null = document.createTreeWalker(
      tab,
      NodeFilter.SHOW_TEXT,
      (node: Node): number => node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    ).nextNode()
    if (!label) {
      tab.prepend(PropertyInsightsLabels.tab)
      return tab
    }

    label.textContent = PropertyInsightsLabels.tab

    return tab
  }

  private static attach (): void {
    if (this.section && !this.section.isConnected) {
      document.querySelector(this.anchorSelector)?.after(this.section)
    }

    if (!this.section?.isConnected || this.tab?.isConnected) return

    this.attachTab()
  }

  private static attachTab (): void {
    const tabList: Element | null = document.querySelector(this.tabListSelector)
    const nativeTab: Element | null | undefined = tabList?.firstElementChild
    if (!tabList || !nativeTab) return

    this.tab ??= this.createTab(nativeTab)

    const previousTab: Element | undefined = tabList.children[this.previousTabIndex]
    if (!previousTab) {
      tabList.append(this.tab)
      return
    }

    previousTab.after(this.tab)
  }

  private static watchForRemoval (): void {
    if (this.observer) return

    this.observer = new MutationObserver(() => this.attach())
    this.observer.observe(document.body, { childList: true, subtree: true })
  }
}
