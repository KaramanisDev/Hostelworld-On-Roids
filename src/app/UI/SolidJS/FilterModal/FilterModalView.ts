import { render } from 'solid-js/web'
import type { ViewAdapterInterface } from 'UI/ViewAdapterInterface'
import type { FilterModalViewDTO, FilterCriteria } from 'UI/Renderers/FilterModal/ViewDTOs'
import { FilterModalApp, type FilterModalStateSetters } from './Components/FilterModalApp'

type MountedComponent = {
  disposer: () => void
  setters: FilterModalStateSetters | null
}

export class FilterModalView implements ViewAdapterInterface<FilterModalViewDTO> {
  private mounted: MountedComponent | null = null
  private onFilterApplied: ((criteria: FilterCriteria) => void) | null = null

  public onFilter (callback: (criteria: FilterCriteria) => void): void {
    this.onFilterApplied = callback
  }

  public mount (container: HTMLElement, viewDto: FilterModalViewDTO): void {
    this.dispose()

    let capturedSetters: FilterModalStateSetters | null = null

    const disposer: () => void = render(
      () => FilterModalApp({
        viewDto,
        onFilterApplied: (criteria: FilterCriteria) => this.onFilterApplied?.(criteria),
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
