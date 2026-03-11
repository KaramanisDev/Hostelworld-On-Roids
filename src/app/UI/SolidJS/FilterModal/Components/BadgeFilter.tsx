import type { JSX } from 'solid-js'
import type { BadgeFilterViewDTO } from 'UI/Renderers/FilterModal/ViewDTOs'
import type { BadgeColor } from 'Services/PropertyBadgeService'

type Properties = {
  filter: BadgeFilterViewDTO
  onChange: (key: string, enabled: boolean) => void
}

type BadgeStyle = {
  color: string
  'background-color': string
}

export const BadgeFilter = (properties: Properties): JSX.Element => {
  const badgeStyle = (color: BadgeColor): BadgeStyle => ({
    color: `var(--wds-color-${color})`,
    'background-color': `var(--wds-color-${color}-lightest)`
  })

  const handleChange = (event: Event): void => {
    const target: HTMLInputElement = event.target as HTMLInputElement
    properties.onChange(properties.filter.key, target.checked)
  }

  return (
    <label class="badge-filter">
      <input
        type="checkbox"
        checked={properties.filter.enabled}
        onChange={handleChange}
      />
      <span class="badge-indicator" style={badgeStyle(properties.filter.color)}>
        {properties.filter.label}
      </span>
    </label>
  )
}
