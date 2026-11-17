import type { ListenerInterface } from 'Core/ListenerInterface'
import type { EventArgs, EventName } from 'Core/EventCatalogue'
import type { Search } from 'DTOs/Search'
import type { Session } from 'DTOs/Session'
import type { Property } from 'DTOs/Property'
import type { Stay } from 'DTOs/Stay'
import { EventBus } from 'Core/EventBus'

export abstract class AbstractListener implements ListenerInterface<EventName> {
  private session!: Session

  constructor (attributes: Record<string, unknown>) {
    Object.assign(this, attributes)
  }

  public abstract handle (...args: unknown[]): Promise<void> | void

  protected emit<TEvent extends EventName> (event: TEvent, ...args: EventArgs<TEvent>): void {
    return EventBus.emit(event, ...args)
  }

  protected latestSearchInSession (): Search | undefined {
    return this.session.getLatestSearch()
  }

  protected persistSearchInSession (search: Search): void {
    return this.session.updateLatestSearch(search)
  }

  protected forgetSearchInSession (): void {
    return this.session.forgetLatestSearch()
  }

  protected persistPropertyInSession (property: Property): void {
    return this.session.persistProperty(property)
  }

  protected propertyInSession (
    propertyId: number,
    stay: Stay | undefined = this.latestSearchInSession()?.getStay()
  ): Property | undefined {
    if (!stay) return undefined

    return this.session.pullProperty(propertyId, stay)
  }
}
