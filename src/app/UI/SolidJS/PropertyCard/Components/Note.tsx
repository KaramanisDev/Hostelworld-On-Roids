import type { JSX } from 'solid-js'

type Properties = {
  message: string
  isLoading?: boolean
}

export function Note (properties: Properties): JSX.Element {
  function noteClass (): string { return properties.isLoading ? 'hor-note hor-loading' : 'hor-note' }

  return (
    <div class={noteClass()}>
      {properties.message}
    </div>
  )
}
