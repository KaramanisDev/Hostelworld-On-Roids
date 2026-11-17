import type { Property } from 'DTOs/Property'
import type { PropertyPage } from 'DTOs/PropertyPage'
import type { Property as SearchProperty } from 'Types/HostelworldSearch'
import type { DisplayedProperty } from 'Services/Hostelworld/Page'
import type { FetchedMetric, MetricsRequest } from 'Services/PropertyMetrics'
import type { FilterCriteria } from 'Services/PropertyFilterService'

type EventCatalogue = {
  'app:inited': []
  'worker:disconnected': []
  'worker:tasks:cancel': []
  'hostelworld:search:intercepted': [properties: SearchProperty[]]
  'hostelworld:properties:displayed': [properties: DisplayedProperty[]]
  'property:cards:visible': [propertyIds: number[]]
  'property:metrics:requested': [request: MetricsRequest]
  'property:metric:fetched': [fetched: FetchedMetric]
  'property:render': [propertyOrId: Property | number]
  'property:page:displayed': [page: PropertyPage]
  'property:page:left': []
  'filter:applied': [criteria: FilterCriteria]
}

export type EventName = keyof EventCatalogue

export type EventArgs<TEvent extends EventName> = EventCatalogue[TEvent]
