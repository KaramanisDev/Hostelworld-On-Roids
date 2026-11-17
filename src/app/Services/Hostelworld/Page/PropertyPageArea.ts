import { PropertyPage } from 'DTOs/PropertyPage'
import { Stay } from 'DTOs/Stay'
import { promiseFallback, waitFor } from 'Utils'
import { NuxtApp } from './NuxtApp'
import type { HostelworldPropertyDetails, NuxtAppInstance, VueRoute, VuexStore } from './HostelworldVueTypes'

type PropertyPageListener = (page: PropertyPage | null) => void

type SectionTab = {
  label: string
  className: string
}

type RoutedPage = {
  key: string
}

type SectionPlacement = {
  section: HTMLElement
  tab: SectionTab
}

export class PropertyPageArea {
  private static readonly detailsTimeoutInMs: number = 30 * 1000
  private static readonly anchorSelector: string = '.property-about'
  private static readonly tabListSelector: string = '.nav .tab-list'
  private static readonly previousTabIndex: number = 1
  private static routedPage: RoutedPage | null = null
  private static placement: SectionPlacement | null = null
  private static tabElement: HTMLElement | null = null
  private static observer: MutationObserver | null = null

  public static async onPageChanged (listener: PropertyPageListener): Promise<void> {
    const app: NuxtAppInstance = await NuxtApp.app()

    return NuxtApp.onRouteChanged(() => this.updatePage(app.$router.currentRoute, listener))
  }

  public static placeSection (section: HTMLElement, tab: SectionTab): void {
    const isOtherSection: boolean = this.placement !== null && this.placement.section !== section
    if (isOtherSection) this.removeSection()

    this.placement = { section, tab }

    this.attachSection()
    this.watchForRemoval()
  }

  public static removeSection (): void {
    this.observer?.disconnect()
    this.placement?.section.remove()
    this.tabElement?.remove()

    this.observer = null
    this.placement = null
    this.tabElement = null
  }

  private static async updatePage (route: VueRoute, listener: PropertyPageListener): Promise<void> {
    const propertyId: number = Number(route.params.id)
    const isPropertyPage: boolean = NuxtApp.isPropertyRoute(route) && Number.isInteger(propertyId)
    if (!isPropertyPage) return this.leavePage(listener)

    const stay: Stay = new Stay({ from: new Date(route.query.from), to: new Date(route.query.to) })
    const pageKey: string = stay.getPropertyKey(propertyId)
    if (pageKey === this.routedPage?.key) return
    if (this.routedPage) listener(null)

    const page: RoutedPage = { key: pageKey }
    this.routedPage = page

    const details: HostelworldPropertyDetails | undefined = await promiseFallback(this.propertyDetails(propertyId))
    const isMounted: boolean = await NuxtApp.hasMounted()
    if (page !== this.routedPage) return
    if (!details || !isMounted) {
      this.routedPage = null
      return
    }

    listener(new PropertyPage({
      id: propertyId,
      name: details.name,
      overallRating: details.rating?.total || null,
      stay
    }))
  }

  private static leavePage (listener: PropertyPageListener): void {
    if (!this.routedPage) return

    this.routedPage = null
    listener(null)
  }

  private static async propertyDetails (propertyId: number): Promise<HostelworldPropertyDetails> {
    const store: VuexStore = await NuxtApp.store()

    return waitFor(
      (): HostelworldPropertyDetails | undefined => {
        const details: HostelworldPropertyDetails | null = store.state.property.property

        return details && Number(details.id) === propertyId ? details : undefined
      },
      this.detailsTimeoutInMs,
      `Details of property ${propertyId} are not available within the specified time.`
    )
  }

  private static attachSection (): void {
    const placement: SectionPlacement | null = this.placement
    if (!placement) return

    if (!placement.section.isConnected) {
      document.querySelector(this.anchorSelector)?.after(placement.section)
    }

    if (!placement.section.isConnected || this.tabElement?.isConnected) return

    this.attachTab(placement)
  }

  private static attachTab (placement: SectionPlacement): void {
    const tabList: Element | null = document.querySelector(this.tabListSelector)
    const nativeTab: Element | null | undefined = tabList?.firstElementChild
    if (!tabList || !nativeTab) return

    this.tabElement ??= this.createTab(nativeTab, placement)

    const previousTab: Element | undefined = tabList.children[this.previousTabIndex]
    if (!previousTab) {
      tabList.append(this.tabElement)
      return
    }

    previousTab.after(this.tabElement)
  }

  private static createTab (nativeTab: Element, placement: SectionPlacement): HTMLElement {
    const tab: HTMLElement = nativeTab.cloneNode(true) as HTMLElement
    tab.classList.add(placement.tab.className)
    tab.addEventListener('click', () => placement.section.scrollIntoView({ behavior: 'smooth' }))

    const label: Node | null = document.createTreeWalker(
      tab,
      NodeFilter.SHOW_TEXT,
      (node: Node): number => node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    ).nextNode()
    if (!label) {
      tab.prepend(placement.tab.label)
      return tab
    }

    label.textContent = placement.tab.label

    return tab
  }

  private static watchForRemoval (): void {
    if (this.observer) return

    this.observer = new MutationObserver(() => this.attachSection())
    this.observer.observe(document.body, { childList: true, subtree: true })
  }
}
