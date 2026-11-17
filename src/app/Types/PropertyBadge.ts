export type BadgeColor = 'purple' | 'pink' | 'orange' | 'blue' | 'red' | 'teal'

export type BadgeId = 'greatForSolo' | 'femaleFriendly' | 'youngCrowd' | 'midAgeCrowd' | 'matureCrowd' | 'closedDown'

export type PropertyBadge = {
  id: BadgeId
  label: string
  color: BadgeColor
}
