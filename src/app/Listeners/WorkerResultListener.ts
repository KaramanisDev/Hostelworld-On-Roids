import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyCardRenderer } from 'UI/Renderers/PropertyCard'
import { PropertyInsightsRenderer } from 'UI/Renderers/PropertyInsights'
import { SearchResultsArea } from 'Services/Hostelworld/Page'
import { PropertyMetricsService, type CollectedMetric, type MetricsProgress } from 'Services/PropertyMetrics'
import type { WorkerResult } from 'WorkerTasks/WorkerTaskCatalogue'

@Subscribe('worker:result')
export class WorkerResultListener extends AbstractListener {
  public handle (result: WorkerResult): void {
    const progress: MetricsProgress = PropertyMetricsService.collect(result)

    this.showCollectedMetric(progress.collected)

    for (const property of progress.composed) {
      this.persistPropertyInSession(property)
      this.emit('property:render', property)
    }

    if (progress.composed.length) SearchResultsArea.scheduleRefresh()
  }

  private showCollectedMetric (collected: CollectedMetric): void {
    const isShownOnCard: boolean = collected.metric === 'reviews' || this.isLatestSearchStay(collected.stay)
    if (isShownOnCard) void PropertyCardRenderer.updateMetric(collected)

    PropertyInsightsRenderer.updateMetric(collected)
  }
}
