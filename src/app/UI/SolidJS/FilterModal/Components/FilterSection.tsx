import { For, Show, type JSX } from 'solid-js'
import type { FilterSectionViewDTO } from 'UI/Renderers/FilterModal/ViewDTOs'
import { BadgeFilter } from './BadgeFilter'
import { RangeFilter } from './RangeFilter'

type Properties = {
  section: FilterSectionViewDTO
  onBadgeChange: (key: string, enabled: boolean) => void
  onRangeMinChange: (key: string, value: number) => void
  onRangeMaxChange: (key: string, value: number) => void
}

export function FilterSection (properties: Properties): JSX.Element {
  return (
    <div class="hor-filter-section">
      <h3 class="hor-filter-section-title">{properties.section.title}</h3>
      <div class="hor-filter-section-content">
        <Show when={properties.section.badgeFilters}>
          <div class="hor-badge-filters">
            <For each={properties.section.badgeFilters}>
              {filter => (
                <BadgeFilter
                  filter={filter}
                  onChange={properties.onBadgeChange}
                />
              )}
            </For>
          </div>
        </Show>
        <Show when={properties.section.rangeFilters}>
          <div class="hor-range-filters">
            <For each={properties.section.rangeFilters}>
              {filter => (
                <RangeFilter
                  filter={filter}
                  onMinChange={properties.onRangeMinChange}
                  onMaxChange={properties.onRangeMaxChange}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}
