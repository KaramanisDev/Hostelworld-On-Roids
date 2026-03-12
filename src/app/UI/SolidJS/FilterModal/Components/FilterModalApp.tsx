import { createSignal, Show, type JSX, type Setter } from 'solid-js'
import type { FilterModalViewDTO, FilterCriteria } from 'UI/Renderers/FilterModal/ViewDTOs'
import { FilterModalViewDTOFactory } from 'UI/Renderers/FilterModal/ViewDTOs'
import { FilterButton } from './FilterButton'
import { FilterModal } from './FilterModal'

export type FilterModalStateSetters = {
  setViewDto: Setter<FilterModalViewDTO>
}

type Properties = {
  viewDto: FilterModalViewDTO
  onFilterApplied: (criteria: FilterCriteria) => void
  onStateReady: (setters: FilterModalStateSetters) => void
}

export function FilterModalApp (properties: Properties): JSX.Element {
  const [viewDto, setViewDto] = createSignal(properties.viewDto)
  let stateBeforeOpen: FilterModalViewDTO | null = null

  properties.onStateReady({ setViewDto })

  function saveStateBeforeOpen (): void {
    stateBeforeOpen = viewDto()
  }

  function restoreStateBeforeOpen (): void {
    if (stateBeforeOpen) {
      setViewDto({ ...stateBeforeOpen, isOpen: false })
      stateBeforeOpen = null
      return
    }

    setViewDto(previous => ({ ...previous, isOpen: false }))
  }

  function commitChanges (): void {
    stateBeforeOpen = null
  }

  function handleOpen (): void {
    saveStateBeforeOpen()
    setViewDto(previous => ({ ...previous, isOpen: true }))
  }

  function handleClose (): void {
    restoreStateBeforeOpen()
  }

  function enabledBadges (sections: FilterModalViewDTO['sections']): FilterCriteria['badges'] {
    const badges: FilterCriteria['badges'] = {}

    for (const section of sections) {
      if (!section.badgeFilters) continue

      for (const filter of section.badgeFilters) {
        if (!filter.enabled) continue
        badges[filter.key] = true
      }
    }

    return badges
  }

  function modifiedRanges (sections: FilterModalViewDTO['sections']): FilterCriteria['ranges'] {
    const ranges: FilterCriteria['ranges'] = {}

    for (const section of sections) {
      if (!section.rangeFilters) continue

      for (const filter of section.rangeFilters) {
        if (filter.rangeMin === filter.min && filter.rangeMax === filter.max) continue
        ranges[filter.key] = { min: filter.rangeMin, max: filter.rangeMax }
      }
    }

    return ranges
  }

  function filterCriteria (): FilterCriteria {
    const sections: FilterModalViewDTO['sections'] = viewDto().sections

    return {
      badges: enabledBadges(sections),
      ranges: modifiedRanges(sections)
    }
  }

  function handleReset (): void {
    commitChanges()
    setViewDto(() => {
      const reset: FilterModalViewDTO = FilterModalViewDTOFactory.create()
      return { ...reset, isOpen: false }
    })
    properties.onFilterApplied({ badges: {}, ranges: {} })
  }

  function handleApply (): void {
    commitChanges()
    setViewDto(previous => ({ ...previous, isOpen: false }))

    const criteria: FilterCriteria = filterCriteria()
    properties.onFilterApplied(criteria)
  }

  function handleBadgeChange (key: string, enabled: boolean): void {
    setViewDto(previous => ({
      ...previous,
      sections: previous.sections.map(section => {
        if (!section.badgeFilters) return section

        return {
          ...section,
          badgeFilters: section.badgeFilters.map(filter =>
            filter.key === key ? { ...filter, enabled } : filter
          )
        }
      })
    }))
  }

  function handleRangeChange (key: string, field: 'rangeMin' | 'rangeMax', value: number): void {
    setViewDto(previous => ({
      ...previous,
      sections: previous.sections.map(section => {
        if (!section.rangeFilters) return section

        return {
          ...section,
          rangeFilters: section.rangeFilters.map(filter =>
            filter.key === key ? { ...filter, [field]: value } : filter
          )
        }
      })
    }))
  }

  function handleRangeMinChange (key: string, value: number): void {
    handleRangeChange(key, 'rangeMin', value)
  }

  function handleRangeMaxChange (key: string, value: number): void {
    handleRangeChange(key, 'rangeMax', value)
  }

  return (
    <>
      <a
        class="hor-donate-button"
        href={viewDto().donateUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Buy Me a Coffee"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d={[
              'M12 21.35l-1.45-1.32C5.4 15.36',
              '2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74',
              '0 3.41.81 4.5 2.09C13.09 3.81 14.76 3',
              '16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4',
              '6.86-8.55 11.54L12 21.35z'
            ].join(' ')}
            fill="#e74c6f"
          />
          <g transform="translate(5.5, 5) scale(0.55)">
            <path
              d="M17 8h1a4 4 0 110 8h-1"
              stroke="#fff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"
              stroke="#fff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="6" y1="2" x2="6" y2="4"
              stroke="#fff" stroke-width="2.5"
              stroke-linecap="round"
            />
            <line
              x1="10" y1="2" x2="10" y2="4"
              stroke="#fff" stroke-width="2.5"
              stroke-linecap="round"
            />
            <line
              x1="14" y1="2" x2="14" y2="4"
              stroke="#fff" stroke-width="2.5"
              stroke-linecap="round"
            />
          </g>
        </svg>
      </a>
      <FilterButton onClick={handleOpen} logo={viewDto().logo} />
      <Show when={viewDto().isOpen}>
        <FilterModal
          title={viewDto().title}
          extensionName={viewDto().extensionName}
          version={viewDto().version}
          homepage={viewDto().homepage}
          donateUrl={viewDto().donateUrl}
          sections={viewDto().sections}
          onClose={handleClose}
          onReset={handleReset}
          onApply={handleApply}
          onBadgeChange={handleBadgeChange}
          onRangeMinChange={handleRangeMinChange}
          onRangeMaxChange={handleRangeMaxChange}
        />
      </Show>
    </>
  )
}
