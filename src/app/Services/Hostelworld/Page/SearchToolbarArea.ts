import { NuxtApp } from './NuxtApp'

type SlotListener = (slot: HTMLElement) => void

export class SearchToolbarArea {
  private static readonly shareButtonSelector: string = '.search .property-share.share-button-container'
  private static observer: MutationObserver | null = null

  public static async keepFilterSlot (className: string, onSlot: SlotListener): Promise<void> {
    if (this.observer) return

    const isMounted: boolean = await NuxtApp.hasMounted()
    if (!isMounted || this.observer) return

    this.insertSlot(className, onSlot)

    this.observer = new MutationObserver(() => this.insertSlot(className, onSlot))
    this.observer.observe(document.body, { childList: true, subtree: true })
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
}
