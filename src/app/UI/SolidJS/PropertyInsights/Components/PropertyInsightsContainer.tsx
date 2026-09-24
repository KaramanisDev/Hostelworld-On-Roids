import { createSignal, type Setter, type JSX } from 'solid-js'
import type { PropertyBadge } from 'Services/PropertyBadgeService'
import type { GuestCountryViewDTO, PropertyInsightsViewDTO } from 'UI/Renderers/PropertyInsights/ViewDTOs'
import { PropertyInsightsLabels } from 'UI/Renderers/PropertyInsights/ViewDTOs'
import { PropertyCardContainer, type CardStateSetters } from 'UI/SolidJS/PropertyCard/Components/PropertyCardContainer'
import { BadgeTagsContainer } from 'UI/SolidJS/BadgeTags/Components/BadgeTagsContainer'
import { GuestCountries } from './GuestCountries'

export type InsightsStateSetters = CardStateSetters & {
  setBadges: Setter<PropertyBadge[]>
  setCountries: Setter<GuestCountryViewDTO[] | undefined>
}

type Properties = {
  viewDto: PropertyInsightsViewDTO
  onStateReady: (setters: InsightsStateSetters) => void
}

export function PropertyInsightsContainer (properties: Properties): JSX.Element {
  const [badges, setBadges] = createSignal<PropertyBadge[]>(properties.viewDto.badges)
  const [countries, setCountries] = createSignal<GuestCountryViewDTO[] | undefined>(
    properties.viewDto.countries
  )

  function handleCardStateReady (setters: CardStateSetters): void {
    properties.onStateReady({ ...setters, setBadges, setCountries })
  }

  return (
    <>
      <div class="hor-insights-header">
        <h2 class="about-title title-3-bld">{PropertyInsightsLabels.title}</h2>
        <div class="hor-insights-badges">
          <BadgeTagsContainer badges={badges()} />
        </div>
      </div>

      <div class="hor-insights-card">
        <PropertyCardContainer
          propertyId={properties.viewDto.propertyId}
          initialState={{
            reviews: properties.viewDto.reviews,
            availability: properties.viewDto.availability,
            ageGroups: properties.viewDto.ageGroups,
            recentRating: properties.viewDto.recentRating
          }}
          onStateReady={handleCardStateReady}
        >
          <GuestCountries countries={countries()} />
        </PropertyCardContainer>
      </div>
    </>
  )
}
