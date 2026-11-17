import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { SearchResultsArea } from 'Services/Hostelworld/Page'
import { PropertyMetricsService, type MetricsProgress } from 'Services/PropertyMetrics'
import type { WorkerResult } from 'WorkerTasks/WorkerTaskCatalogue'

@Subscribe('worker:result')
export class WorkerResultListener extends AbstractListener {
  public handle (result: WorkerResult): void {
    const progress: MetricsProgress = PropertyMetricsService.collect(result)

    void PropertyCardRenderer.updateMetric(progress.collected)
    PropertyInsightsRenderer.updateMetric(progress.collected)

    for (const property of progress.composed) {
      this.persistPropertyInSession(property)
      this.emit('property:render', property)
    }

    if (progress.composed.length) SearchResultsArea.scheduleRefresh()
  }
}
