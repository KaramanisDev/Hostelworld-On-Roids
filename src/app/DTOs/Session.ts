import type { Search } from 'DTOs/Search'
import type { Property } from 'DTOs/Property'
import type { Stay } from 'DTOs/Stay'

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

  public pullProperty (propertyId: number, stay: Stay): Property | undefined {
    return this.properties[stay.getPropertyKey(propertyId)]
  }

  public persistProperty (property: Property): void {
    this.properties[property.getStay().getPropertyKey(property.getId())] = property
  }
}
