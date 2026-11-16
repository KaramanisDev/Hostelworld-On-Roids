import type { Stay } from 'DTOs/Stay'
import type { Metric } from './PropertyCompositionBuffer'
import { emptyFunction } from 'Utils'

export type ScheduledProperty = {
  id: number
  name: string
  overallRating: number | null
  stay: Stay
}

type StartListener = (property: ScheduledProperty) => void

export class PropertyMetricsScheduler {
  private static readonly maxRunningProperties: number = 6
  private static readonly metricsPerProperty: number = 3
  private static readonly stalledAfterInMs: number = 2 * 60 * 1000
  private static readonly queued: Map<number, ScheduledProperty> = new Map()
  private static readonly running: Map<number, Set<Metric>> = new Map()
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

  public static complete (propertyId: number, metric: Metric): void {
    const collectedMetrics: Set<Metric> | undefined = this.running.get(propertyId)
    if (!collectedMetrics) return

    collectedMetrics.add(metric)
    if (collectedMetrics.size < this.metricsPerProperty) return

    this.release(propertyId, collectedMetrics)
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
    const collectedMetrics: Set<Metric> = new Set()

    this.queued.delete(property.id)
    this.running.set(property.id, collectedMetrics)
    setTimeout(() => this.release(property.id, collectedMetrics), this.stalledAfterInMs)

    this.startListener(property)
  }

  private static release (propertyId: number, collectedMetrics: Set<Metric>): void {
    if (this.running.get(propertyId) !== collectedMetrics) return

    this.running.delete(propertyId)
    this.startNext()
  }

  private static nextQueued (): ScheduledProperty | undefined {
    const prioritizedId: number | undefined = [...this.visibleIds, ...this.displayedIds]
      .find(propertyId => this.queued.has(propertyId))
    if (prioritizedId === undefined) return this.queued.values().next().value

    return this.queued.get(prioritizedId)
  }
}
