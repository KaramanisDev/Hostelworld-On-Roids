import { createSignal, createMemo, type Setter, type JSX } from 'solid-js'
import type { MetricRowViewDTO } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyCardNotes } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { MetricsRow } from './MetricsRow'
import { Note } from './Note'

export type CardState = {
  reviews?: MetricRowViewDTO | null
  availability?: MetricRowViewDTO | null
  ageGroups?: MetricRowViewDTO | null
}

export type CardStateSetters = {
  setReviews: Setter<MetricRowViewDTO | null | undefined>
  setAvailability: Setter<MetricRowViewDTO | null | undefined>
  setAgeGroups: Setter<MetricRowViewDTO | null | undefined>
}

type Properties = {
  propertyId: number
  initialState: CardState
  onStateReady: (setters: CardStateSetters) => void
}

export function PropertyCardContainer (properties: Properties): JSX.Element {
  const [reviews, setReviews] = createSignal<MetricRowViewDTO | null | undefined>(
    properties.initialState.reviews
  )
  const [availability, setAvailability] = createSignal<MetricRowViewDTO | null | undefined>(
    properties.initialState.availability
  )
  const [ageGroups, setAgeGroups] = createSignal<MetricRowViewDTO | null | undefined>(
    properties.initialState.ageGroups
  )

  properties.onStateReady({ setReviews, setAvailability, setAgeGroups })

  const isFinalized = createMemo(() =>
    reviews() !== undefined && availability() !== undefined && ageGroups() !== undefined
  )
  const isLoading = createMemo(() => !isFinalized())
  const note = createMemo(() => isFinalized() ? PropertyCardNotes.finalized : PropertyCardNotes.loading)

  return (
    <>
      <div class="metrics-grid" data-property-id={properties.propertyId}>
        <MetricsRow metricType="reviews" data={reviews()} />
        <MetricsRow metricType="ageGroups" data={ageGroups()} />
        <MetricsRow metricType="availability" data={availability()} />
      </div>

      <Note message={note()} isLoading={isLoading()} />
    </>
  )
}
