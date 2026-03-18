import { Show, For, type JSX } from 'solid-js'
import type { RecentRatingViewDTO } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyCardLabels } from 'UI/Renderers/PropertyCard/ViewDTOs'

type Properties = {
  data?: RecentRatingViewDTO | null
}

export function RecentRating (properties: Properties): JSX.Element {
  const title: string = PropertyCardLabels.titleForType('recentRating')
  const labels: ReadonlyArray<string> = PropertyCardLabels.forType('recentRating')

  function isDisabled (): boolean { return properties.data === null }
  function isLoaded (): boolean { return properties.data !== null && properties.data !== undefined }

  function valueClass (index: number): string {
    const isTrendColumn: boolean = index === 1

    return isTrendColumn && properties.data?.trendDirection
      ? `hor-value hor-trend hor-trend-${properties.data.trendDirection}`
      : 'hor-value'
  }

  return (
    <Show when={!isDisabled()}>
      <div class={`hor-row hor-rating-row${isLoaded() ? ' hor-loaded' : ''}`}>
        <div class="hor-title">
          <span>{title}</span>
          <span>→</span>
        </div>
        <For each={[...labels]}>
          {(label, index) => (
            <div class="hor-item">
              <div class="hor-label">{label}</div>
              <div class={valueClass(index())}>
                <Show when={isLoaded()} fallback={<div class="hor-skeleton-pulse" />}>
                  {properties.data?.items[index()]?.value ?? ''}
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  )
}
