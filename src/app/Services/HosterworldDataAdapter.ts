import type { HostelworldSearchProperties, Property as AvailableProperty } from 'Types/HostelworldSearchProperties'
import type { HostelworldSearchUnavailableProperties, Property as UnavailableProperty } from 'Types/HostelworldSearchUnavailableProperties'

type HostelworldSearch = HostelworldSearchProperties | HostelworldSearchUnavailableProperties
type Properties = AvailableProperty[] | UnavailableProperty[]

export class HosterworldDataAdapter {
  public static adaptSearch (search: HostelworldSearch): HostelworldSearch {
    search.properties = <Properties>search.properties.map(property => {
      if ('isFeatured' in property) {
        (property as AvailableProperty).isFeatured = false;
      }

      return property
    })

    return search
  }
}
