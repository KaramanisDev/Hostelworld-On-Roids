import { createSignal, Show, type JSX, type Setter } from 'solid-js'
import type { FilterModalViewDTO, FilterCriteria } from 'UI/Renderers/FilterModal/ViewDTOs'
import { FilterModalViewDTOFactory } from 'UI/Renderers/FilterModal/ViewDTOs'
import { FilterButton } from './FilterButton'
import { FilterModal } from './FilterModal'
import { EventBus } from 'Core/EventBus'

export type FilterModalStateSetters = {
  setViewDto: Setter<FilterModalViewDTO>
}

type Properties = {
  viewDto: FilterModalViewDTO
  eventBus: typeof EventBus
  onStateReady: (setters: FilterModalStateSetters) => void
}

export const FilterModalApp = (properties: Properties): JSX.Element => {
  const [viewDto, setViewDto] = createSignal(properties.viewDto)
  let stateBeforeOpen: FilterModalViewDTO | null = null

  properties.onStateReady({ setViewDto })

  const saveStateBeforeOpen = (): void => {
    stateBeforeOpen = viewDto()
  }

  const restoreStateBeforeOpen = (): void => {
    if (stateBeforeOpen) {
      setViewDto({ ...stateBeforeOpen, isOpen: false })
      stateBeforeOpen = null
      return
    }

    setViewDto(previous => ({ ...previous, isOpen: false }))
  }

  const commitChanges = (): void => {
    stateBeforeOpen = null
  }

  const handleOpen = (): void => {
    saveStateBeforeOpen()
    setViewDto(previous => ({ ...previous, isOpen: true }))
  }

  const handleClose = (): void => {
    restoreStateBeforeOpen()
  }

  const enabledBadges = (sections: FilterModalViewDTO['sections']): FilterCriteria['badges'] => {
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

  const modifiedRanges = (sections: FilterModalViewDTO['sections']): FilterCriteria['ranges'] => {
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

  const filterCriteria = (): FilterCriteria => {
    const sections: FilterModalViewDTO['sections'] = viewDto().sections

    return {
      badges: enabledBadges(sections),
      ranges: modifiedRanges(sections)
    }
  }

  const handleReset = (): void => {
    commitChanges()
    setViewDto(() => {
      const reset: FilterModalViewDTO = FilterModalViewDTOFactory.create()
      return { ...reset, isOpen: false }
    })
    properties.eventBus.emit('filter:applied', { badges: {}, ranges: {} })
  }

  const handleApply = (): void => {
    commitChanges()
    setViewDto(previous => ({ ...previous, isOpen: false }))

    const criteria: FilterCriteria = filterCriteria()
    properties.eventBus.emit('filter:applied', criteria)
  }

  const handleBadgeChange = (key: string, enabled: boolean): void => {
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

  const handleRangeChange = (key: string, field: 'rangeMin' | 'rangeMax', value: number): void => {
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

  const handleRangeMinChange = (key: string, value: number): void => {
    handleRangeChange(key, 'rangeMin', value)
  }

  const handleRangeMaxChange = (key: string, value: number): void => {
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
