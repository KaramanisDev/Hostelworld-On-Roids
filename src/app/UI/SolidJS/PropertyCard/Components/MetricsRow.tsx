import { Show, For, type JSX } from 'solid-js'
import type { MetricRowViewDTO, MetricType } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyCardLabels } from 'UI/Renderers/PropertyCard/ViewDTOs'

type Properties = {
  metricType: MetricType
  data?: MetricRowViewDTO | null
}

export function MetricsRow (properties: Properties): JSX.Element {
  const title: string = PropertyCardLabels.titleForType(properties.metricType)
  const labels: ReadonlyArray<string> = PropertyCardLabels.forType(properties.metricType)
  function isDisabled (): boolean { return properties.data === null }
  function isLoaded (): boolean { return properties.data !== null && properties.data !== undefined }

  return (
    <Show when={!isDisabled()}>
      <div class={`hor-row${isLoaded() ? ' hor-loaded' : ''}`} data-metric={properties.metricType}>
        <div class="hor-title">
          <span>{title}</span>
        </div>
        <For each={[...labels]}>
          {(label, index) => (
            <div class="hor-item">
              <div class="hor-label">{label}</div>
              <div class="hor-value">
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
