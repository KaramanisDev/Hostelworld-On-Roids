import type { Search } from 'DTOs/Search'
import type { Property } from 'DTOs/Property'
import type { PropertyPage } from 'DTOs/PropertyPage'
import type { Stay } from 'DTOs/Stay'

type ComposedProperties = Record<string, Property>

export class Session {
  private latestSearch?: Search
  private displayedPage?: PropertyPage
  private properties: ComposedProperties = {}

  public getLatestSearch (): Search | undefined {
    return this.latestSearch
  }

  public updateLatestSearch (search: Search): void {
    this.latestSearch = search
  }

  public forgetLatestSearch (): void {
    this.latestSearch = undefined
  }

  public isLatestSearch (search: Search): boolean {
    return Boolean(this.latestSearch?.isSameAs(search))
  }

  public isLatestStay (stay: Stay): boolean {
    return Boolean(this.latestSearch?.getStay().isSameAs(stay))
  }

  public updateDisplayedPage (page: PropertyPage): void {
    this.displayedPage = page
  }

  public forgetDisplayedPage (): void {
    this.displayedPage = undefined
  }

  public isDisplayedProperty (propertyId: number): boolean {
    return this.displayedPage?.getId() === propertyId
  }

  public isDisplayedStay (propertyId: number, stay: Stay): boolean {
    return this.isDisplayedProperty(propertyId) && Boolean(this.displayedPage?.getStay().isSameAs(stay))
  }

  public getProperty (
    propertyId: number,
    stay: Stay | undefined = this.latestSearch?.getStay()
  ): Property | undefined {
    if (!stay) return undefined

    return this.properties[stay.getPropertyKey(propertyId)]
  }

  public persistProperty (property: Property): void {
    this.properties[property.getStay().getPropertyKey(property.getId())] = property
  }
}
