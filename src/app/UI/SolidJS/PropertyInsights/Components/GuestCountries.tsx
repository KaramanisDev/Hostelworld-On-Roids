import { Show, For, type JSX } from 'solid-js'
import type { GuestCountryViewDTO } from 'UI/Renderers/PropertyInsights/ViewDTOs'
import { PropertyInsightsLabels } from 'UI/Renderers/PropertyInsights/ViewDTOs'

type Properties = {
  countries?: GuestCountryViewDTO[]
}

export function GuestCountries (properties: Properties): JSX.Element {
  function isLoaded (): boolean { return properties.countries !== undefined }
  function hasCountries (): boolean { return Boolean(properties.countries?.length) }

  return (
    <Show when={!isLoaded() || hasCountries()}>
      <div class="hor-guest-countries">
        <div class="hor-title">
          <span>{PropertyInsightsLabels.countries}</span>
        </div>
        <div class="hor-guest-countries-flags">
          <Show when={isLoaded()} fallback={<div class="hor-skeleton-pulse" />}>
            <For each={properties.countries}>
              {(country) => (
                <span class="hor-guest-country" title={country.label}>
                  <img src={country.flag} alt={country.code} />
                  <span class="hor-guest-country-count">{country.count}</span>
                </span>
              )}
            </For>
          </Show>
        </div>
      </div>
    </Show>
  )
}
