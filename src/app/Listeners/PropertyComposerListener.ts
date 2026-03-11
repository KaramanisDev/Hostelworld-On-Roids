import { Subscribe } from 'Core/EventBus'
import { AbstractListener } from './AbstractListener'
import { PropertyFactory } from 'Factories/PropertyFactory'
import { PropertyCompositionBuffer } from 'Services/PropertyCompositionBuffer'
import type { CompletedProperty, Metric, MetricData } from 'Services/PropertyCompositionBuffer'
import type { Property } from 'DTOs/Property'

type MetricPayload = {
  propertyId: number
  propertyName: string
  data: MetricData
}

@Subscribe('property:metric:collected')
export class PropertyComposerListener extends AbstractListener {
  public handle (metric: Metric, payload: MetricPayload): void {
    PropertyCompositionBuffer.register(payload.propertyId, payload.propertyName)
    PropertyCompositionBuffer.collect(payload.propertyId, metric, payload.data)

    const entry: CompletedProperty | undefined = PropertyCompositionBuffer.completedEntry(payload.propertyId)
    if (!entry) return

    PropertyCompositionBuffer.remove(entry.id)

    const property: Property = PropertyFactory.create(
      entry.id,
      entry.name,
      entry.reviews,
      entry.availability,
      entry.countries
    )

    this.emit('property:composed', property)
  }
}
