import type { Property } from 'DTOs/Property'
import { waitForElement } from 'Utils'
import type { ReviewMetrics } from 'DTOs/ReviewMetrics'
import type { AvailabilityMetrics } from 'DTOs/AvailabilityMetrics'
import { HostelworldDataManipulator } from 'Services/HostelworldDataManipulator'

type MetricItem = {
  label: string,
  value: string
}

export class SearchPropertyRenderer {
  public static async render (property: Property): Promise<void> {
    await waitForElement('.property-card .property-card-container')

    const propertyCards: NodeListOf<Element> = document.querySelectorAll('.property-card')
    const propertyCard: Element | undefined = [...propertyCards].find(
      card =>
        card.innerHTML.includes(property.getId()) &&
        card.innerHTML.includes(this.htmlEncode(property.getName()))
    )

    if (!propertyCard) return
    this.cleanUpRenderedElementsOf(propertyCard)

    const metrics: HTMLElement = this.elementWith('div', 'metrics-grid')
    metrics.append(
      this.reviewMetrics(property.getReviewMetrics())
    )
    metrics.append(
      this.availabilityMetrics(property.getAvailabilityMetrics())
    )
    propertyCard.append(metrics)

    const updateNote: HTMLElement = this.elementWith(
      'div', 'note', 'ℹ️ Data displayed here can take up to an hour to be refreshed.'
    )
    propertyCard.append(updateNote)

    await HostelworldDataManipulator.setPropertyBookings(
      propertyCard, property.getBookedCountries()
    )
  }

  public static async renderProcessingMessage (propertyId: string): Promise<void> {
    await waitForElement('.property-card .property-card-container')

    const propertyCards: NodeListOf<Element> = document.querySelectorAll('.property-card')
    const propertyCard: Element | undefined = [...propertyCards].find(
      card => card.innerHTML.includes(propertyId)
    )

    if (!propertyCard) return

    this.cleanUpRenderedElementsOf(propertyCard)
    const note: HTMLElement = this.elementWith(
      'div', 'note', '🔄 Property data are being processed...'
    )
    propertyCard.append(note)
  }

  private static cleanUpRenderedElementsOf (propertyCard: Element): void {
    const metricsElement: HTMLDivElement | null = propertyCard.querySelector('.metrics-grid')
    if (metricsElement) metricsElement.remove()

    const note: HTMLDivElement | null = propertyCard.querySelector('.note')
    if (note) note.remove()
  }

  private static reviewMetrics (metrics: ReviewMetrics): HTMLElement {
    const items: MetricItem[] = [
      { label: 'Male', value: `${metrics.getMale()} (${metrics.getMalePercentage()}%)` },
      { label: 'Female', value: `${metrics.getFemale()} (${metrics.getFemalePercentage()}%)` },
      { label: 'Other', value: `${metrics.getOther()} (${metrics.getOtherPercentage()}%)` },
      { label: 'Solo', value: `${metrics.getSolo()} (${metrics.getSoloPercentage()}%)` },
      { label: 'Total', value: String(metrics.getTotal()) }
    ]

    return this.metricsRow('Reviews', items)
  }

  private static availabilityMetrics (metrics: AvailabilityMetrics): HTMLElement {
    const items: MetricItem[] = [
      {
        label: 'Mixed',
        value: `${metrics.getMixedBeds()}/${metrics.getMaxMixedBeds()} (${metrics.getMixedBedsPercentage()}%)`
      },
      {
        label: 'Female',
        value: `${metrics.getFemaleBeds()}/${metrics.getMaxFemaleBeds()} (${metrics.getFemaleBedsPercentage()}%)`
      },
      {
        label: 'Private',
        value: `${metrics.getPrivateRooms()}/${metrics.getMaxPrivateRooms()} (${metrics.getPrivateRoomsPercentage()}%)`
      },
      {
        label: 'Guests',
        value: `${metrics.getGuests()}/${metrics.getMaxGuests()} (${metrics.getGuestsPercentage()}%)`
      }
    ]

    return this.metricsRow('Availability', items)
  }

  private static metricsRow (title: string, items: MetricItem[]): HTMLElement {
    const rowElement: HTMLElement = this.elementWith('div', 'row')

    const titleElement: HTMLElement = this.elementWith('div', 'title')
    titleElement.append(this.elementWith('span', undefined, title))
    titleElement.append(this.elementWith('span', undefined, '→'))

    rowElement.append(titleElement)

    for (const { label, value } of items) {
      const item: HTMLElement = this.elementWith('div', 'item')
      item.append(this.elementWith('div', 'label', label))
      item.append(this.elementWith('div', 'value', value))

      rowElement.append(item)
    }

    return rowElement
  }

  private static elementWith (tagName: string, className?: string, textContent?: string): HTMLElement {
    const element: HTMLElement = document.createElement(tagName)
    if (className) element.className = className
    if (textContent) element.textContent = textContent

    return element
  }

  private static htmlEncode (value: string): string {
    const element: HTMLDivElement = document.createElement('div')
    element.textContent = value
    return element.innerHTML
  }
}
