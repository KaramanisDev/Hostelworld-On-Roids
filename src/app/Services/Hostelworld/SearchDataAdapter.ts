import type { HostelworldSearch } from 'Types/HostelworldSearch'

export class SearchDataAdapter {
  public static withoutPromotions (search: HostelworldSearch): HostelworldSearch {
    return {
      ...search,
      properties: search.properties.map(property => ({
        ...property,
        isElevate: false,
        isFeatured: false,
        isPromoted: false,
        promotions: property.promotions.map(
          promotion => ({ ...promotion, campaign: undefined })
        )
      }))
    }
  }
}
