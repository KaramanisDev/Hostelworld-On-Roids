import { For } from 'solid-js'
import type { PropertyBadge } from 'Services/PropertyBadgeService'
import { BadgeTag } from './BadgeTag'

type Properties = {
  badges: PropertyBadge[]
}

export const BadgeTagsContainer = (properties: Properties) => {
  return (
    <For each={properties.badges}>
      {(badge) => <BadgeTag badge={badge} />}
    </For>
  )
}
