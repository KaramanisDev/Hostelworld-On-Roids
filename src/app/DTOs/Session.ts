import type { Search } from 'DTOs/Search'
import type { Property } from 'DTOs/Property'
import { stayKey } from 'Utils'

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

  public pullProperty (propertyId: number, from: Date, to: Date): Property | undefined {
    return this.properties[this.propertyKey(propertyId, from, to)]
  }

  public persistProperty (property: Property): void {
    this.properties[this.propertyKey(property.getId(), property.getFrom(), property.getTo())] = property
  }

  private propertyKey (propertyId: number, from: Date, to: Date): string {
    return `${propertyId}|${stayKey(from, to)}`
  }
}
