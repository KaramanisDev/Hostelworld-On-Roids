import type { JSX } from 'solid-js'

type Properties = {
  onClick: () => void
  logo: string
}

export const FilterButton = (properties: Properties): JSX.Element => {
  return (
    <button
      type="button"
      class="extension-filter-button"
      onClick={properties.onClick}
      aria-label="Extension Filters"
    >
      <img src={properties.logo} alt="Filter" width="30" height="30" />
    </button>
  )
}
