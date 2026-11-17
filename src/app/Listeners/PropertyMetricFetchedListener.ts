import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { SearchResultsArea } from 'Services/Hostelworld/Page'
import type { Property } from 'DTOs/Property'
import {
  PropertyMetricsService,
  type CollectedMetric,
  type FetchedMetric
} from 'Services/PropertyMetrics'

@Subscribe('property:metric:fetched')
export class PropertyMetricFetchedListener extends AbstractListener {
  public handle (fetched: FetchedMetric): void {
    const collected: CollectedMetric = PropertyMetricsService.collectedMetric(fetched)
    PropertyMetricsService.collect(fetched.request, collected)

    void PropertyCardRenderer.updateMetric(collected, this.session)
    PropertyInsightsRenderer.updateMetric(collected, this.session)

    const composed: Property[] = PropertyMetricsService.takeComposed(collected.propertyId)
    for (const property of composed) {
      this.session.persistProperty(property)
      this.emit('property:render', property)
    }

    if (composed.length) SearchResultsArea.scheduleRefresh()
  }
}
