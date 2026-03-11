export interface ViewAdapterInterface<TDto> {
  mount (container: HTMLElement, viewDto: TDto): void
  update? (viewDto: Partial<TDto>): void
  dispose (): void
}
