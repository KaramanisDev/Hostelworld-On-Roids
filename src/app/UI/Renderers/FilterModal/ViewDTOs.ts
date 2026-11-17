import type { BadgeColor, BadgeId } from 'Types/PropertyBadge'
import { PropertyFilterService } from 'Services/PropertyFilterService'
import type { FilterCriteria, RangeDimension, RangeKey, RangeSection } from 'Services/PropertyFilterService'
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

type RangeLabel = {
  label: string
  description: string
}

export class FilterModalLabels {
  public static readonly sections: Record<RangeSection, string> = {
    demographics: 'Demographics',
    ageGroups: 'Age Groups'
  }

  public static readonly ranges: Record<RangeKey, RangeLabel> = {
    male: { label: 'Male %', description: 'Filter by percentage of male reviewers' },
    female: { label: 'Female %', description: 'Filter by percentage of female reviewers' },
    solo: { label: 'Solo %', description: 'Filter by percentage of solo travelers' },
    age18to24: { label: '18-24 %', description: 'Filter by percentage of 18-24 year olds' },
    age25to30: { label: '25-30 %', description: 'Filter by percentage of 25-30 year olds' },
    age31to40: { label: '31-40 %', description: 'Filter by percentage of 31-40 year olds' },
    age41plus: { label: '41+ %', description: 'Filter by percentage of 41+ year olds' }
  }
}

export class FilterModalViewDTOFactory {
  public static create (criteria: FilterCriteria = { badges: {}, ranges: {} }): FilterModalViewDTO {
    return {
      isOpen: false,
      title: 'Filter Properties',
      version: ExtensionConfig.version(),
      homepage: ExtensionConfig.homepage(),
      donateUrl: 'https://buymeacoffee.com/karamanisdev',
      logo: ExtensionConfig.asset('icon'),
      extensionName: ExtensionConfig.extensionName(),
      sections: [
        this.badgesSection(criteria),
        this.rangesSection('demographics', criteria),
        this.rangesSection('ageGroups', criteria)
      ]
    }
  }

  public static criteria (sections: FilterSectionViewDTO[]): FilterCriteria {
    return {
      badges: this.enabledBadges(sections),
      ranges: this.modifiedRanges(sections)
    }
  }

  private static badgesSection (criteria: FilterCriteria): FilterSectionViewDTO {
    return {
      title: 'Badges',
      badgeFilters: PropertyFilterService.filterableBadges().map(badge => ({
        key: badge.id,
        label: badge.label,
        color: badge.color,
        enabled: criteria.badges[badge.id] ?? false
      }))
    }
  }

  private static rangesSection (section: RangeSection, criteria: FilterCriteria): FilterSectionViewDTO {
    return {
      title: FilterModalLabels.sections[section],
      rangeFilters: PropertyFilterService.rangeDimensionsIn(section).map(
        dimension => this.rangeFilter(dimension, criteria)
      )
    }
  }

  private static rangeFilter (dimension: RangeDimension, criteria: FilterCriteria): RangeFilterViewDTO {
    return {
      key: dimension.key,
      label: FilterModalLabels.ranges[dimension.key].label,
      description: FilterModalLabels.ranges[dimension.key].description,
      min: 0,
      max: 100,
      rangeMin: criteria.ranges[dimension.key]?.min ?? 0,
      rangeMax: criteria.ranges[dimension.key]?.max ?? 100
    }
  }

  private static enabledBadges (sections: FilterSectionViewDTO[]): FilterCriteria['badges'] {
    const badges: FilterCriteria['badges'] = {}

    for (const section of sections) {
      if (!section.badgeFilters) continue

      for (const filter of section.badgeFilters) {
        if (!filter.enabled) continue
        badges[filter.key] = true
      }
    }

    return badges
  }

  private static modifiedRanges (sections: FilterSectionViewDTO[]): FilterCriteria['ranges'] {
    const ranges: FilterCriteria['ranges'] = {}

    for (const section of sections) {
      if (!section.rangeFilters) continue

      for (const filter of section.rangeFilters) {
        if (filter.rangeMin === filter.min && filter.rangeMax === filter.max) continue
        ranges[filter.key] = { min: filter.rangeMin, max: filter.rangeMax }
      }
    }

    return ranges
  }
}
