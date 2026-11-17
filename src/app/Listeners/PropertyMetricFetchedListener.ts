import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { SearchResultsArea } from 'Services/Hostelworld/Page'
import { PropertyMetricsService, type FetchedMetric, type MetricsProgress } from 'Services/PropertyMetrics'

@Subscribe('property:metric:fetched')
export class PropertyMetricFetchedListener extends AbstractListener {
  public handle (fetched: FetchedMetric): void {
    const progress: MetricsProgress = PropertyMetricsService.collect(fetched)

    void PropertyCardRenderer.updateMetric(progress.collected)
    PropertyInsightsRenderer.updateMetric(progress.collected)

    for (const property of progress.composed) {
      this.persistPropertyInSession(property)
      this.emit('property:render', property)
    }

    if (progress.composed.length) SearchResultsArea.scheduleRefresh()
  }
}
