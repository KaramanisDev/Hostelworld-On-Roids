import { render } from 'solid-js/web'
import type { PropertyBadge } from 'Types/PropertyBadge'
import type { ViewAdapterInterface } from 'UI/ViewAdapterInterface'
import { BadgeTagsContainer } from './Components/BadgeTagsContainer'

export type BadgeTagsViewDTO = {
  propertyId: number
  badges: PropertyBadge[]
}

type BadgeEntry = {
  disposer: () => void
  wrapper: HTMLElement
}

export class BadgeTagsView implements ViewAdapterInterface<BadgeTagsViewDTO> {
  private readonly entries: Map<number, BadgeEntry> = new Map()
  private readonly wrapperClass: string = 'hor-badge-tags-wrapper'

  public mount (tagsContainer: HTMLElement, viewDto: BadgeTagsViewDTO): void {
    this.disposeEntry(viewDto.propertyId)

    if (!viewDto.badges.length) return

    const wrapper: HTMLSpanElement = document.createElement('span')
    wrapper.className = this.wrapperClass
    wrapper.dataset.propertyId = String(viewDto.propertyId)
    tagsContainer.appendChild(wrapper)

    const disposer: () => void = render(
      () => BadgeTagsContainer({ badges: viewDto.badges }),
      wrapper
    )

    this.entries.set(viewDto.propertyId, { disposer, wrapper })
  }

  public dispose (): void {
    for (const propertyId of this.entries.keys()) {
      this.disposeEntry(propertyId)
    }
  }

  private disposeEntry (propertyId: number): void {
    const entry: BadgeEntry | undefined = this.entries.get(propertyId)
    if (!entry) return

    entry.disposer()
    entry.wrapper.remove()
    this.entries.delete(propertyId)
  }
}
