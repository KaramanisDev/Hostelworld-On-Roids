type VisibilityListener = (propertyIds: number[]) => void

export class PropertyCardVisibilityTracker {
  private readonly preloadMargin: string = '200px 0px'
  private readonly propertyIds: WeakMap<Element, number> = new WeakMap()
  private readonly visibleCards: Set<Element> = new Set()
  private readonly observer: IntersectionObserver
  private readonly onChange: VisibilityListener

  constructor (onChange: VisibilityListener) {
    this.onChange = onChange
    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => this.updateVisibleCards(entries),
      { rootMargin: this.preloadMargin }
    )
  }

  public track (card: HTMLElement, propertyId: number): void {
    const isVisibleCardReused: boolean = this.visibleCards.has(card) && this.propertyIds.get(card) !== propertyId

    this.propertyIds.set(card, propertyId)
    this.observer.observe(card)

    if (isVisibleCardReused) this.onChange(this.visiblePropertyIds())
  }

  private updateVisibleCards (entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.visibleCards.add(entry.target)
        continue
      }

      this.visibleCards.delete(entry.target)
    }

    this.onChange(this.visiblePropertyIds())
  }

  private visiblePropertyIds (): number[] {
    return [...this.visibleCards]
      .sort((first: Element, second: Element): number => this.comparePageOrder(first, second))
      .map((card: Element): number | undefined => this.propertyIds.get(card))
      .filter((propertyId: number | undefined): propertyId is number => propertyId !== undefined)
  }

  private comparePageOrder (first: Element, second: Element): number {
    const isFirstAboveSecond: boolean = Boolean(
      first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
    )

    return isFirstAboveSecond ? -1 : 1
  }
}
