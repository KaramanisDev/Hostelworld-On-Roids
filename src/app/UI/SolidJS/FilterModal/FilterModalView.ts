import { render } from 'solid-js/web'
import type { ViewAdapterInterface } from 'UI/ViewAdapterInterface'
import type { FilterModalViewDTO } from 'UI/Renderers/FilterModal/ViewDTOs'
import { FilterModalApp, type FilterModalStateSetters } from './Components/FilterModalApp'
import { EventBus } from 'Core/EventBus'

type MountedComponent = {
  disposer: () => void
  setters: FilterModalStateSetters | null
}

export class FilterModalView implements ViewAdapterInterface<FilterModalViewDTO> {
  private mounted: MountedComponent | null = null

  public mount (container: HTMLElement, viewDto: FilterModalViewDTO): void {
    this.dispose()

    let capturedSetters: FilterModalStateSetters | null = null

    const disposer: () => void = render(
      () => FilterModalApp({
        viewDto,
        eventBus: EventBus,
        onStateReady: (setters: FilterModalStateSetters) => {
          capturedSetters = setters
        }
      }),
      container
    )

    this.mounted = { disposer, setters: capturedSetters }
  }

  public update (viewDto: Partial<FilterModalViewDTO>): void {
    if (!this.mounted?.setters) return

    this.mounted.setters.setViewDto(previous => ({ ...previous, ...viewDto }))
  }

  public dispose (): void {
    if (!this.mounted) return

    this.mounted.disposer()
    this.mounted = null
  }
}
