import { HostelWorldSearchResponse } from '../Types/HostelworlSearchResponse'

export class HosterworldAdapter {
  static adaptSearch (response: HostelWorldSearchResponse): HostelWorldSearchResponse {
    response.properties = response.properties.map(property => {
      property.isFeatured = false

      return property
    })

    return response
  }
}
