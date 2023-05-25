import type { ListenerInterface } from './ListenerInterface'
import type { Session } from 'DTOs/Session'
import { EventBus } from 'Core/EventBus'

export abstract class AbstractListener implements ListenerInterface {
  private session!: Session

  constructor (attributes: Record<string, Date>) {
    Object.assign(this, attributes)
  }

  public abstract handle (...args: [unknown]): Promise<void> | void

  protected emit (event: string, ...args: unknown[]): void {
    return EventBus.emit(event, ...args)
  }
}
