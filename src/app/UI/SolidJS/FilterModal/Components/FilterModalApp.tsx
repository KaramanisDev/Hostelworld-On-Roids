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
      <FilterButton onClick={handleOpen} logo={viewDto().logo} />
      <Show when={viewDto().isOpen}>
        <FilterModal
          title={viewDto().title}
          extensionName={viewDto().extensionName}
          version={viewDto().version}
          homepage={viewDto().homepage}
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
