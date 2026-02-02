type Properties = {
  message: string
  isLoading?: boolean
}

export const Note = (properties: Properties) => {
  const className: string = properties.isLoading ? 'note loading' : 'note'
  const dataAttributes: Record<string, string> = properties.isLoading ? { 'data-note-type': 'loading' } : {}

  return (
    <div class={className} {...dataAttributes}>
      {properties.message}
    </div>
  )
}
