import type { EventArgs, EventName } from './EventCatalogue'

export interface ListenerInterface<TEvent extends EventName> {
  handle: (...args: EventArgs<TEvent>) => Promise<void> | void
}
