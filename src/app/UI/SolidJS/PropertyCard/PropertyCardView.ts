import { render } from 'solid-js/web'
import type { ViewAdapterInterface } from '../../ViewAdapterInterface'
import type { PropertyCardViewDTO } from '../../Renderers/PropertyCard/ViewDTOs'
import { PropertyCardContainer, type CardState, type CardStateSetters } from './Components/PropertyCardContainer'

type CardEntry = {
  disposer: () => void
  wrapper: HTMLElement
  setters: CardStateSetters | null
}

export class PropertyCardView implements ViewAdapterInterface<PropertyCardViewDTO> {
  private readonly entries: Map<number, CardEntry> = new Map()

  public mount (container: HTMLElement, viewDto: PropertyCardViewDTO): void {
    this.mountContainer(container, viewDto.propertyId, {
      reviews: viewDto.reviews,
      availability: viewDto.availability
    })
  }

  public update (viewDto: Partial<PropertyCardViewDTO>): void {
    if (!viewDto.propertyId) return

    const entry: CardEntry | undefined = this.entries.get(viewDto.propertyId)
    if (!entry?.setters) return

    if ('reviews' in viewDto) {
      entry.setters.setReviews(viewDto.reviews)
    }

    if ('availability' in viewDto) {
      entry.setters.setAvailability(viewDto.availability)
    }
  }

  public dispose (): void {
    for (const propertyId of this.entries.keys()) {
      this.disposeEntry(propertyId)
    }
  }

  private disposeEntry (propertyId: number): void {
    const entry: CardEntry | undefined = this.entries.get(propertyId)
    if (!entry) return

    entry.disposer()
    entry.wrapper.remove()
    this.entries.delete(propertyId)
  }

  private mountContainer (container: HTMLElement, propertyId: number, initialState: CardState): void {
    this.disposeEntry(propertyId)

    const wrapper: HTMLDivElement = document.createElement('div')
    wrapper.className = 'property-card-wrapper'
    wrapper.dataset.propertyId = String(propertyId)
    container.appendChild(wrapper)

    let capturedSetters: CardStateSetters | null = null

    const disposer: () => void = render(
      () => PropertyCardContainer({
        propertyId,
        initialState,
        onStateReady: (setters: CardStateSetters) => {
          capturedSetters = setters
        }
      }),
      wrapper
    )

    this.entries.set(propertyId, { disposer, wrapper, setters: capturedSetters })
  }
}
