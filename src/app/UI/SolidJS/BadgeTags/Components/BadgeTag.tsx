import type { JSX } from 'solid-js'
import type { PropertyBadge } from 'Services/PropertyBadgeService'

type Properties = {
  badge: PropertyBadge
}

export function BadgeTag (properties: Properties): JSX.Element {
  return (
    <div class="tag-overlay tag-wrapper tag-skew-right extension-tag-badge">
      <div
        class="tag-text"
        style={{
          color: `var(--wds-color-${properties.badge.color})`,
          'background-color': `var(--wds-color-${properties.badge.color}-lightest)`
        }}
      >
        {properties.badge.label}
      </div>
    </div>
  )
}
