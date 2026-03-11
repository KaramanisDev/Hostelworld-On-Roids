import { For, type JSX } from 'solid-js'
import type { FilterSectionViewDTO } from 'UI/Renderers/FilterModal/ViewDTOs'
import { FilterSection } from './FilterSection'

type Properties = {
  title: string
  extensionName: string
  version: string
  homepage: string
  sections: FilterSectionViewDTO[]
  onClose: () => void
  onReset: () => void
  onApply: () => void
  onBadgeChange: (key: string, enabled: boolean) => void
  onRangeMinChange: (key: string, value: number) => void
  onRangeMaxChange: (key: string, value: number) => void
}

export const FilterModal = (properties: Properties): JSX.Element => {
  const handleOverlayClick = (event: MouseEvent): void => {
    if (event.target !== event.currentTarget) return

    properties.onClose()
  }

  return (
    <div class="filter-modal-overlay" onClick={handleOverlayClick}>
      <div class="filter-modal">
        <header class="filter-modal-header">
          <h2 class="filter-modal-title">{properties.title}</h2>
          <button
            type="button"
            class="filter-modal-close"
            onClick={properties.onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <main class="filter-modal-content">
          <For each={properties.sections}>
            {section => (
              <FilterSection
                section={section}
                onBadgeChange={properties.onBadgeChange}
                onRangeMinChange={properties.onRangeMinChange}
                onRangeMaxChange={properties.onRangeMaxChange}
              />
            )}
          </For>
        </main>
        <footer class="filter-modal-footer">
          <div class="filter-modal-info">
            <span class="filter-modal-info-name">{properties.extensionName}</span>
            <span class="filter-modal-info-version">v{properties.version}</span>
          </div>
          <div class="filter-modal-links">
            <a
              href={properties.homepage}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span class="filter-modal-separator">•</span>
            <a
              href={`${properties.homepage}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Report Issue
            </a>
          </div>
          <div class="filter-modal-actions">
            <button
              type="button"
              class="filter-modal-button filter-modal-button-reset"
              onClick={properties.onReset}
            >
              Reset
            </button>
            <button
              type="button"
              class="filter-modal-button filter-modal-button-apply"
              onClick={properties.onApply}
            >
              Apply
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
