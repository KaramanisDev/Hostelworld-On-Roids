import { createSignal, createMemo, type Setter } from 'solid-js'
import type { MetricRowViewDTO } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { PropertyCardNotes } from 'UI/Renderers/PropertyCard/ViewDTOs'
import { MetricsRow } from './MetricsRow'
import { Note } from './Note'

export type CardState = {
  reviews?: MetricRowViewDTO | null
  availability?: MetricRowViewDTO | null
}

export type CardStateSetters = {
  setReviews: Setter<MetricRowViewDTO | null | undefined>
  setAvailability: Setter<MetricRowViewDTO | null | undefined>
}

type Properties = {
  propertyId: number
  initialState: CardState
  onStateReady: (setters: CardStateSetters) => void
}

export const PropertyCardContainer = (properties: Properties) => {
  const [reviews, setReviews] = createSignal<MetricRowViewDTO | null | undefined>(
    properties.initialState.reviews
  )
  const [availability, setAvailability] = createSignal<MetricRowViewDTO | null | undefined>(
    properties.initialState.availability
  )

  properties.onStateReady({ setReviews, setAvailability })

  const isFinalized = createMemo(() => reviews() !== undefined && availability() !== undefined)
  const isLoading = createMemo(() => !isFinalized())
  const note = createMemo(() => isFinalized() ? PropertyCardNotes.finalized : PropertyCardNotes.loading)

  return (
    <>
      <div class="metrics-grid" data-property-id={properties.propertyId}>
        <MetricsRow metricType="reviews" data={reviews()} />
        <MetricsRow metricType="availability" data={availability()} />
      </div>

      <Note message={note()} isLoading={isLoading()} />
    </>
  )
}
