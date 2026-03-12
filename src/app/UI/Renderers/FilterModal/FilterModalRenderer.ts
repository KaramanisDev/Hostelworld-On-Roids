import { FilterModalView } from 'UI/SolidJS/FilterModal/FilterModalView'
import type { FilterModalViewDTO } from './ViewDTOs'
import { FilterModalViewDTOFactory } from './ViewDTOs'
import { waitForElement } from 'Utils'
import { EventBus } from 'Core/EventBus'

export class FilterModalRenderer {
  private static readonly wrapperClassName: string = 'extension-filter-modal-wrapper'
  private static readonly shareButtonSelector: string = '.search .property-share.share-button-container'

  private static wrapper: HTMLDivElement | null = null
  private static observer: MutationObserver | null = null
  private static readonly view: FilterModalView = new FilterModalView()

  public static async render (): Promise<void> {
    if (this.observer) return

    this.view.onFilter(criteria => EventBus.emit('filter:applied', criteria))

    await waitForElement(this.shareButtonSelector)

    this.injectWrapper()
    this.watchForRemoval()
  }

  private static injectWrapper (): void {
    const shareButton: HTMLElement | null = document.querySelector(this.shareButtonSelector)
    if (!shareButton) return

    const parent: HTMLElement | null = shareButton.parentElement
    if (!parent) return

    const existing: HTMLElement | null = parent.querySelector(`.${this.wrapperClassName}`)
    if (existing) return

    this.wrapper = document.createElement('div')
    this.wrapper.className = this.wrapperClassName
    parent.insertBefore(this.wrapper, shareButton)

    const viewDto: FilterModalViewDTO = FilterModalViewDTOFactory.create()
    this.view.mount(this.wrapper, viewDto)
  }

  private static watchForRemoval (): void {
    const shareButton: HTMLElement | null = document.querySelector(this.shareButtonSelector)
    if (!shareButton) return

    const observeTarget: HTMLElement | null = shareButton.parentElement
    if (!observeTarget) return

    this.observer = new MutationObserver(() => {
      const existing: HTMLElement | null = observeTarget.querySelector(`.${this.wrapperClassName}`)
      if (existing) return

      this.injectWrapper()
    })

    this.observer.observe(observeTarget, { childList: true, subtree: true })
  }
}
