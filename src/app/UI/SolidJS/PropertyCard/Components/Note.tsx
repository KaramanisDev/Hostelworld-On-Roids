import type { JSX } from 'solid-js'

type Properties = {
  message: string
  isLoading?: boolean
}

export function Note (properties: Properties): JSX.Element {
  const className: string = properties.isLoading ? 'hor-note hor-loading' : 'hor-note'
  const dataAttributes: Record<string, string> = properties.isLoading ? { 'data-note-type': 'loading' } : {}

  return (
    <div class={className} {...dataAttributes}>
      {properties.message}
    </div>
  )
}
