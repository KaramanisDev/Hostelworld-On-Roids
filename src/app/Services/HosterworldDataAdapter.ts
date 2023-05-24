import type { HostelworldSearchProperties, Property as AvailableProperty } from 'Types/HostelworldSearchProperties'
import type { HostelworldSearchUnavailableProperties, Property as UnavailableProperty } from 'Types/HostelworldSearchUnavailableProperties'

export type HostelworldSearch = HostelworldSearchProperties | HostelworldSearchUnavailableProperties

type Properties = AvailableProperty[] | UnavailableProperty[]

export class HosterworldDataAdapter {
  public static adaptSearch (search: HostelworldSearch): HostelworldSearch {
    search.properties = <Properties>search.properties.map(property => {
      if ('isFeatured' in property) {
        (property as AvailableProperty).isElevate = false;
        (property as AvailableProperty).isFeatured = false;
        (property as AvailableProperty).isPromoted = false;
        (property as AvailableProperty).promotions = (property as AvailableProperty).promotions.map(
          promotion => {
            delete promotion.campaign

            return promotion
          }
        )
      }

      return property
    })

    return search
  }
}
