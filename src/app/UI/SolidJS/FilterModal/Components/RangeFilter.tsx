import { createSignal, createEffect, type JSX } from 'solid-js'
import type { RangeFilterViewDTO } from 'UI/Renderers/FilterModal/ViewDTOs'

type Properties = {
  filter: RangeFilterViewDTO
  onMinChange: (key: string, value: number) => void
  onMaxChange: (key: string, value: number) => void
}

export const RangeFilter = (properties: Properties): JSX.Element => {
  const minimumGap: number = 10

  const [localMin, setLocalMin] = createSignal(properties.filter.rangeMin)
  const [localMax, setLocalMax] = createSignal(properties.filter.rangeMax)

  createEffect(() => {
    setLocalMin(properties.filter.rangeMin)
  })

  createEffect(() => {
    setLocalMax(properties.filter.rangeMax)
  })

  const clampedMinValue = (value: number): number => {
    const upperBound: number = localMax() - minimumGap
    return Math.min(value, upperBound)
  }

  const clampedMaxValue = (value: number): number => {
    const lowerBound: number = localMin() + minimumGap
    return Math.max(value, lowerBound)
  }

  const handleMinInput = (event: Event): void => {
    const target: HTMLInputElement = event.target as HTMLInputElement
    const clamped: number = clampedMinValue(Number(target.value))
    setLocalMin(clamped)
    target.value = String(clamped)
  }

  const handleMaxInput = (event: Event): void => {
    const target: HTMLInputElement = event.target as HTMLInputElement
    const clamped: number = clampedMaxValue(Number(target.value))
    setLocalMax(clamped)
    target.value = String(clamped)
  }

  const handleMinCommit = (): void => {
    properties.onMinChange(properties.filter.key, localMin())
  }

  const handleMaxCommit = (): void => {
    properties.onMaxChange(properties.filter.key, localMax())
  }

  return (
    <div class="range-filter">
      <div class="range-filter-header">
        <label class="range-filter-label">{properties.filter.label}</label>
        <span class="range-filter-values">
          {localMin()}% - {localMax()}%
        </span>
      </div>
      <div class="range-filter-sliders">
        <input
          type="range"
          class="range-slider range-slider-min"
          min={properties.filter.min}
          max={properties.filter.max}
          value={localMin()}
          onInput={handleMinInput}
          onChange={handleMinCommit}
        />
        <input
          type="range"
          class="range-slider range-slider-max"
          min={properties.filter.min}
          max={properties.filter.max}
          value={localMax()}
          onInput={handleMaxInput}
          onChange={handleMaxCommit}
        />
      </div>
    </div>
  )
}
