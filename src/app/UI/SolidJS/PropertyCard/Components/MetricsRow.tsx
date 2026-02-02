import { Show, For } from 'solid-js'
import type { MetricRowViewDTO, MetricType } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyCardLabels } from 'UI/Renderers/PropertyCard/ViewDTOs'

type Properties = {
  metricType: MetricType
  data?: MetricRowViewDTO | null
}

export const MetricsRow = (properties: Properties) => {
  const title: string = PropertyCardLabels.titleForType(properties.metricType)
  const labels: ReadonlyArray<string> = PropertyCardLabels.forType(properties.metricType)
  const isDisabled = (): boolean => properties.data === null
  const isLoaded = (): boolean => properties.data !== null && properties.data !== undefined

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
