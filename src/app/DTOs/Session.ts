import type { Search } from 'DTOs/Search'
import type { Property } from 'DTOs/Property'

type ComposedProperties = Record<string, Property>

export class Session {
  private latestSearch?: Search
  private properties: ComposedProperties = {}

  public getLatestSearch (): Search | undefined {
    return this.latestSearch
  }

  public updateLatestSearch (search: Search): void {
    this.latestSearch = search
  }

  public pullProperty (propertyId: string): Property | undefined {
    return this.properties[propertyId]
  }

  public persistProperty (property: Property): void {
    this.properties[property.getId()] = property
  }
}
