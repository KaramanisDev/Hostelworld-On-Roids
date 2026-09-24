import { render } from 'solid-js/web'
import type { ViewAdapterInterface } from 'UI/ViewAdapterInterface'
import type { PropertyInsightsViewDTO } from 'UI/Renderers/PropertyInsights/ViewDTOs'
import { PropertyInsightsContainer, type InsightsStateSetters } from './Components/PropertyInsightsContainer'

type MountedComponent = {
  disposer: () => void
  setters: InsightsStateSetters | null
}

export class PropertyInsightsView implements ViewAdapterInterface<PropertyInsightsViewDTO> {
  private mounted: MountedComponent | null = null

  public mount (container: HTMLElement, viewDto: PropertyInsightsViewDTO): void {
    this.dispose()

    let capturedSetters: InsightsStateSetters | null = null

    const disposer: () => void = render(
      () => PropertyInsightsContainer({
        viewDto,
        onStateReady: (setters: InsightsStateSetters) => {
          capturedSetters = setters
        }
      }),
      container
    )

    this.mounted = { disposer, setters: capturedSetters }
  }

  public update (viewDto: Partial<PropertyInsightsViewDTO>): void {
    const setters: InsightsStateSetters | null | undefined = this.mounted?.setters
    if (!setters) return

    if ('reviews' in viewDto) {
      setters.setReviews(viewDto.reviews)
    }

    if ('availability' in viewDto) {
      setters.setAvailability(viewDto.availability)
    }

    if ('ageGroups' in viewDto) {
      setters.setAgeGroups(viewDto.ageGroups)
    }

    if ('recentRating' in viewDto) {
      setters.setRecentRating(viewDto.recentRating)
    }

    if (viewDto.badges) {
      setters.setBadges(viewDto.badges)
    }

    if ('countries' in viewDto) {
      setters.setCountries(viewDto.countries)
    }
  }

  public dispose (): void {
    if (!this.mounted) return

    this.mounted.disposer()
    this.mounted = null
  }
}
