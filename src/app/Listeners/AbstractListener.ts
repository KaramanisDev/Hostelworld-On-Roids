import type { ListenerInterface } from 'Core/ListenerInterface'
import type { EventArgs, EventName } from 'Core/EventCatalogue'
import type { Session } from 'DTOs/Session'
import { EventBus } from 'Core/EventBus'

export abstract class AbstractListener implements ListenerInterface<EventName> {
  protected readonly session!: Session

  constructor (attributes: Record<string, unknown>) {
    Object.assign(this, attributes)
  }

  public abstract handle (...args: unknown[]): Promise<void> | void

  protected emit<TEvent extends EventName> (event: TEvent, ...args: EventArgs<TEvent>): void {
    return EventBus.emit(event, ...args)
  }
}
