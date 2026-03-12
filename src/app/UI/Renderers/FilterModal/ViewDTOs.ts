import type { BadgeColor, BadgeId, BadgeMetadata } from 'Services/PropertyBadgeService'
import { PropertyBadgeService } from 'Services/PropertyBadgeService'
import { ExtensionConfig } from 'Utils/ExtensionConfig'

export type BadgeFilterViewDTO = {
  key: BadgeId
  label: string
  color: BadgeColor
  enabled: boolean
}

export type RangeFilterViewDTO = {
  key: string
  label: string
  description: string
  min: number
  max: number
  rangeMin: number
  rangeMax: number
}

export type FilterSectionViewDTO = {
  title: string
  badgeFilters?: BadgeFilterViewDTO[]
  rangeFilters?: RangeFilterViewDTO[]
}

export type FilterModalViewDTO = {
  isOpen: boolean
  logo: string
  extensionName: string
  title: string
  version: string
  homepage: string
  donateUrl: string
  sections: FilterSectionViewDTO[]
}

export type FilterCriteria = {
  badges: Partial<Record<BadgeId, boolean>>
  ranges: Record<string, { min: number; max: number }>
}

type RangeDefinition = {
  key: string
  label: string
  description: string
}

export class FilterModalViewDTOFactory {
  private static readonly badgeDefinitions: BadgeMetadata[] =
    PropertyBadgeService.badgeMetadata().filter(badge => badge.id !== 'closedDown')

  private static readonly demographicDefinitions: RangeDefinition[] = [
    { key: 'male', label: 'Male %', description: 'Filter by percentage of male reviewers' },
    { key: 'female', label: 'Female %', description: 'Filter by percentage of female reviewers' },
    { key: 'solo', label: 'Solo %', description: 'Filter by percentage of solo travelers' }
  ]

  private static readonly ageGroupDefinitions: RangeDefinition[] = [
    { key: 'age18to24', label: '18-24 %', description: 'Filter by percentage of 18-24 year olds' },
    { key: 'age25to30', label: '25-30 %', description: 'Filter by percentage of 25-30 year olds' },
    { key: 'age31to40', label: '31-40 %', description: 'Filter by percentage of 31-40 year olds' },
    { key: 'age41plus', label: '41+ %', description: 'Filter by percentage of 41+ year olds' }
  ]

  public static create (): FilterModalViewDTO {
    return {
      isOpen: false,
      title: 'Filter Properties',
      version: ExtensionConfig.version(),
      homepage: ExtensionConfig.homepage(),
      donateUrl: 'https://buymeacoffee.com/karamanisdev',
      logo: ExtensionConfig.asset('icon'),
      extensionName: ExtensionConfig.extensionName(),
      sections: [
        this.badgesSection(),
        this.demographicsSection(),
        this.ageGroupsSection()
      ]
    }
  }

  private static badgesSection (): FilterSectionViewDTO {
    return {
      title: 'Badges',
      badgeFilters: this.badgeDefinitions.map(definition => ({
        key: definition.id,
        label: definition.label,
        color: definition.color,
        enabled: false
      }))
    }
  }

  private static demographicsSection (): FilterSectionViewDTO {
    return {
      title: 'Demographics',
      rangeFilters: this.demographicDefinitions.map(definition => ({
        key: definition.key,
        label: definition.label,
        description: definition.description,
        min: 0,
        max: 100,
        rangeMin: 0,
        rangeMax: 100
      }))
    }
  }

  private static ageGroupsSection (): FilterSectionViewDTO {
    return {
      title: 'Age Groups',
      rangeFilters: this.ageGroupDefinitions.map(definition => ({
        key: definition.key,
        label: definition.label,
        description: definition.description,
        min: 0,
        max: 100,
        rangeMin: 0,
        rangeMax: 100
      }))
    }
  }
}
