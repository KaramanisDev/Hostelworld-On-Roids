import type { HostelworldSearch } from 'Types/HostelworldSearch'

export class SearchDataAdapter {
  public static stripPromotions (search: HostelworldSearch): HostelworldSearch {
    search.properties = search.properties.map(property => {
      property.isElevate = false
      property.isFeatured = false
      property.isPromoted = false

      property.promotions = property.promotions.map(
        promotion => {
          delete promotion.campaign

          return promotion
        }
      )

      return property
    })

    return search
  }
}
