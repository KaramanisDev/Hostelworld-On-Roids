import type { Stay } from 'DTOs/Stay'
import type { Metric } from './PropertyCompositionBuffer'
import { emptyFunction } from 'Utils'

export type ScheduledProperty = {
  id: number
  name: string
  overallRating: number | null
  stay: Stay
}

export type MetricsRequest = {
  readonly property: ScheduledProperty
}

export type StartListener = (request: MetricsRequest) => void

type RunningRequest = {
  request: MetricsRequest
  collectedMetrics: Set<Metric>
}

export class PropertyMetricsScheduler {
  private static readonly maxRunningProperties: number = 6
  private static readonly metricsPerProperty: number = 3
  private static readonly stalledAfterInMs: number = 2 * 60 * 1000
  private static readonly queued: Map<number, ScheduledProperty> = new Map()
  private static readonly running: Map<number, RunningRequest> = new Map()
  private static displayedIds: number[] = []
  private static visibleIds: number[] = []
  private static startListener: StartListener = emptyFunction

  public static onStart (listener: StartListener): void {
    this.startListener = listener
  }

  public static schedule (properties: ScheduledProperty[]): void {
    for (const property of properties) {
      if (this.queued.has(property.id) || this.running.has(property.id)) continue

      this.queued.set(property.id, property)
    }

    this.startNext()
  }

  public static complete (request: MetricsRequest, metric: Metric): void {
    const running: RunningRequest | undefined = this.running.get(request.property.id)
    if (running?.request !== request) return

    running.collectedMetrics.add(metric)
    if (running.collectedMetrics.size < this.metricsPerProperty) return

    this.release(request)
  }

  public static prioritizeDisplayed (propertyIds: number[]): void {
    this.displayedIds = propertyIds
  }

  public static prioritizeVisible (propertyIds: number[]): void {
    this.visibleIds = propertyIds
  }

  public static clear (): void {
    this.queued.clear()
    this.running.clear()
  }

  private static startNext (): void {
    while (this.running.size < this.maxRunningProperties) {
      const property: ScheduledProperty | undefined = this.nextQueued()
      if (!property) return

      this.start(property)
    }
  }

  private static start (property: ScheduledProperty): void {
    const request: MetricsRequest = { property }

    this.queued.delete(property.id)
    this.running.set(property.id, { request, collectedMetrics: new Set() })
    setTimeout(() => this.release(request), this.stalledAfterInMs)

    this.startListener(request)
  }

  private static release (request: MetricsRequest): void {
    if (this.running.get(request.property.id)?.request !== request) return

    this.running.delete(request.property.id)
    this.startNext()
  }

  private static nextQueued (): ScheduledProperty | undefined {
    const prioritizedId: number | undefined = [...this.visibleIds, ...this.displayedIds]
      .find(propertyId => this.queued.has(propertyId))
    if (prioritizedId === undefined) return this.queued.values().next().value

    return this.queued.get(prioritizedId)
  }
}
