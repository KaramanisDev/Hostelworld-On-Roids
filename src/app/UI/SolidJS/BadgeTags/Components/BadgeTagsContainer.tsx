import { For, type JSX } from 'solid-js'
import type { PropertyBadge } from 'Types/PropertyBadge'
import { BadgeTag } from './BadgeTag'

type Properties = {
  badges: PropertyBadge[]
}

export function BadgeTagsContainer (properties: Properties): JSX.Element {
  return (
    <For each={properties.badges}>
      {(badge) => <BadgeTag badge={badge} />}
    </For>
  )
}
