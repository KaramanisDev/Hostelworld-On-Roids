import { waitForElement } from 'Utils'

type SlotListener = (slot: HTMLElement) => void

export class SearchToolbarArea {
  private static readonly shareButtonSelector: string = '.search .property-share.share-button-container'
  private static observer: MutationObserver | null = null

  public static async keepFilterSlot (className: string, onSlot: SlotListener): Promise<void> {
    if (this.observer) return

    await waitForElement(this.shareButtonSelector)

    this.insertSlot(className, onSlot)
    this.watchForRemoval(className, onSlot)
  }

  private static insertSlot (className: string, onSlot: SlotListener): void {
    const shareButton: HTMLElement | null = document.querySelector(this.shareButtonSelector)
    const parent: HTMLElement | null | undefined = shareButton?.parentElement
    if (!shareButton || !parent) return

    const existing: HTMLElement | null = parent.querySelector(`.${className}`)
    if (existing) return

    const slot: HTMLDivElement = document.createElement('div')
    slot.className = className
    parent.insertBefore(slot, shareButton)

    onSlot(slot)
  }

  private static watchForRemoval (className: string, onSlot: SlotListener): void {
    const observeTarget: HTMLElement | null | undefined = document
      .querySelector(this.shareButtonSelector)
      ?.parentElement
    if (!observeTarget) return

    this.observer = new MutationObserver(() => {
      const existing: HTMLElement | null = observeTarget.querySelector(`.${className}`)
      if (existing) return

      this.insertSlot(className, onSlot)
    })

    this.observer.observe(observeTarget, { childList: true, subtree: true })
  }
}
