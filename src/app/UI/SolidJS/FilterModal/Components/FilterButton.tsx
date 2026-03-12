import type { JSX } from 'solid-js'

type Properties = {
  onClick: () => void
  logo: string
}

export function FilterButton (properties: Properties): JSX.Element {
  return (
    <button
      type="button"
      class="hor-filter-button"
      onClick={properties.onClick}
      aria-label="Extension Filters"
    >
      <img src={properties.logo} alt="Filter" width="30" height="30" />
    </button>
  )
}
