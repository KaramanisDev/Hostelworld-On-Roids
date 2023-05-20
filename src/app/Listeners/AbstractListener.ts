import type { ListenerInterface } from './ListenerInterface'
import { EventBus } from 'Core/EventBus'

export abstract class AbstractListener implements ListenerInterface {
  public abstract handle (...args: [unknown]): Promise<void> | void

  protected emit (event: string, ...args: unknown[]): void {
    return EventBus.emit(event, ...args)
  }
}
