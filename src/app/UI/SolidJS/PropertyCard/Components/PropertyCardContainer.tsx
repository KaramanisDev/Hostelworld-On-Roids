import { createSignal, createMemo, type Setter, type JSX } from 'solid-js'
import type { MetricRowViewDTO, RecentRatingViewDTO } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyCardNotes } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { MetricsRow } from './MetricsRow'
import { RecentRating } from './RecentRating'
import { Note } from './Note'

export type CardState = {
  reviews?: MetricRowViewDTO | null
  availability?: MetricRowViewDTO | null
  ageGroups?: MetricRowViewDTO | null
  recentRating?: RecentRatingViewDTO | null
  isDisconnected?: boolean
}

export type CardStateSetters = {
  setReviews: Setter<MetricRowViewDTO | null | undefined>
  setAvailability: Setter<MetricRowViewDTO | null | undefined>
  setAgeGroups: Setter<MetricRowViewDTO | null | undefined>
  setRecentRating: Setter<RecentRatingViewDTO | null | undefined>
  setDisconnected: Setter<boolean>
}

type Properties = {
  propertyId: number
  initialState: CardState
  onStateReady: (setters: CardStateSetters) => void
  children?: JSX.Element
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
  const [recentRating, setRecentRating] = createSignal<RecentRatingViewDTO | null | undefined>(
    properties.initialState.recentRating
  )
  const [isDisconnected, setDisconnected] = createSignal<boolean>(properties.initialState.isDisconnected ?? false)

  properties.onStateReady({ setReviews, setAvailability, setAgeGroups, setRecentRating, setDisconnected })

  const isFinalized = createMemo(() =>
    reviews() !== undefined && availability() !== undefined &&
    ageGroups() !== undefined && recentRating() !== undefined
  )
  const isLoading = createMemo(() => !isFinalized() && !isDisconnected())
  const note = createMemo(() => {
    if (isFinalized()) return PropertyCardNotes.finalized

    return isDisconnected() ? PropertyCardNotes.disconnected : PropertyCardNotes.loading
  })

  return (
    <>
      <div class="hor-metrics-grid" data-property-id={properties.propertyId}>
        <RecentRating data={recentRating()} />
        <MetricsRow metricType="reviews" data={reviews()} />
        <MetricsRow metricType="ageGroups" data={ageGroups()} />
        <MetricsRow metricType="availability" data={availability()} />
      </div>

      {properties.children}

      <Note message={note()} isLoading={isLoading()} />
    </>
  )
}
