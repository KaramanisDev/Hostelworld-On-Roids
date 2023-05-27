import type { Property } from 'DTOs/Property'
import { waitForElement } from 'Utils'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'

type MetricItem = {
  label: string,
  value: string
}

export class SearchPropertyRenderer {
  public static async render (property: Property): Promise<void> {
    await waitForElement('.property-card .property')

    const propertyCards: HTMLCollectionOf<Element> = document.getElementsByClassName('property-card')
    const propertyCard: Element | undefined = Array.from(propertyCards).find(
      card =>
        card.innerHTML.includes(property.getId()) &&
        card.innerHTML.includes(this.htmlEncode(property.getName()))
    )

    if (!propertyCard) return

    const metrics: HTMLDivElement = this.elementWith('metrics-grid')

    metrics.appendChild(
      this.reviewMetrics(property.getReviewMetrics())
    )
    metrics.appendChild(
      this.availabilityMetrics(property.getAvailabilityMetrics())
    )

    const existingMetrics: HTMLDivElement | null = propertyCard.querySelector('.metrics-grid')
    if (existingMetrics) existingMetrics.remove()

    propertyCard.appendChild(metrics)
  }

  private static reviewMetrics (metrics: ReviewMetrics): HTMLDivElement {
    const items: MetricItem[] = [
      { label: 'Male:', value: `${metrics.getMale()} (${metrics.getMalePercentage()}%)` },
      { label: 'Female:', value: `${metrics.getFemale()} (${metrics.getFemalePercentage()}%)` },
      { label: 'Other:', value: `${metrics.getOther()} (${metrics.getOtherPercentage()}%)` },
      { label: 'Solo:', value: `${metrics.getSolo()} (${metrics.getSoloPercentage()}%)` },
      { label: 'Total:', value: String(metrics.getTotal()) }
    ]

    return this.metricsRow('Reviews', items)
  }

  private static availabilityMetrics (metrics: AvailabilityMetrics): HTMLDivElement {
    const items: MetricItem[] = [
      {
        label: 'Mixed:',
        value: `${metrics.getMixedBeds()}/${metrics.getMaxMixedBeds()} (${metrics.getMixedBedsPercentage()}%)`
      },
      {
        label: 'Female:',
        value: `${metrics.getFemaleBeds()}/${metrics.getMaxFemaleBeds()} (${metrics.getFemaleBedsPercentage()}%)`
      },
      {
        label: 'Private:',
        value: `${metrics.getPrivateRooms()}/${metrics.getMaxPrivateRooms()} (${metrics.getPrivateRoomsPercentage()}%)`
      },
      {
        label: 'Guests:',
        value: `${metrics.getGuests()}/${metrics.getMaxGuests()} (${metrics.getGuestsPercentage()}%)`
      }
    ]

    return this.metricsRow('Availability', items)
  }

  private static metricsRow (title: string, items: MetricItem[]): HTMLDivElement {
    const rowElement: HTMLDivElement = this.elementWith('row')
    rowElement.appendChild(
      this.elementWith('title', `<span>${title}</span><span>→</span>`)
    )

    for (const { label, value } of items) {
      const item: HTMLDivElement = this.elementWith('item')

      item.appendChild(
        this.elementWith('label', label)
      )
      item.appendChild(
        this.elementWith('value', value)
      )

      rowElement.appendChild(item)
    }

    return rowElement
  }

  private static elementWith (className: string, innerHtml?: string): HTMLDivElement {
    const element: HTMLDivElement = document.createElement('div')
    element.className = className

    if (innerHtml) element.innerHTML = innerHtml

    return element
  }

  private static htmlEncode (value: string): string {
    const element: HTMLDivElement = document.createElement('div')
    element.textContent = value
    return element.innerHTML
  }
}
