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
      <div class={`row${isLoaded() ? ' loaded' : ''}`} data-metric={properties.metricType}>
        <div class="title">
          <span>{title}</span>
          <span>→</span>
        </div>
        <For each={[...labels]}>
          {(label, index) => (
            <div class="item">
              <div class="label">{label}</div>
              <div class="value">
                <Show when={isLoaded()} fallback={<div class="skeleton-pulse" />}>
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
