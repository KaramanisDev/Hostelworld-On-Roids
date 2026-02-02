import type { PropertyBadge } from 'Services/PropertyBadgeService'

type Properties = {
  badge: PropertyBadge
}

export const BadgeTag = (properties: Properties) => {
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
