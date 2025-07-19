import type { ListenerInterface } from './ListenerInterface'
import type { Search } from 'DTOs/Search'
import type { Session } from 'DTOs/Session'
import type { Property } from 'DTOs/Property'
import { EventBus } from 'Core/EventBus'

export abstract class AbstractListener implements ListenerInterface {
  private session!: Session

  constructor (attributes: Record<string, unknown>) {
    Object.assign(this, attributes)
  }

  public abstract handle (...args: unknown[]): Promise<void> | void

  protected emit (event: string, ...args: unknown[]): void {
    return EventBus.emit(event, ...args)
  }

  protected latestSearchInSession (): Search | undefined {
    return this.session.getLatestSearch()
  }

  protected persistSearchInSession (search: Search): void {
    return this.session.updateLatestSearch(search)
  }

  protected persistPropertyInSession (property: Property): void {
    return this.session.persistProperty(property)
  }

  protected propertyInSession (propertyId: number): Property | undefined {
    return this.session.pullProperty(propertyId)
  }
}
