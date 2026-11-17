import type { ListenerInterface } from './ListenerInterface'
import type { EventArgs, EventName } from './EventCatalogue'

type ListenerHandler = (...args: unknown[]) => void | Promise<void>

type ListenerAttributes = Record<string, unknown>
type ListenerClass<TEvent extends EventName> = new (attributes: ListenerAttributes) => ListenerInterface<TEvent>
type EventHandler<TEvent extends EventName> = (...args: EventArgs<TEvent>) => void | Promise<void>

export class EventBus {
  private static readonly listeners: Map<EventName, ListenerHandler[]> = new Map()
  private static listenerInitWithAttributes: ListenerAttributes = {}

  public static initWith (attributes: ListenerAttributes): void {
    this.listenerInitWithAttributes = attributes
  }

  public static subscribe<TEvent extends EventName> (event: TEvent, ListenerClass: ListenerClass<TEvent>): void {
    const listener: ListenerInterface<TEvent> = new ListenerClass(
      this.listenerInitWithAttributes
    )

    return this.listen(event, listener.handle.bind(listener))
  }

  public static listen<TEvent extends EventName> (event: TEvent, callback: EventHandler<TEvent>): void {
    const handlers: ListenerHandler[] = this.listeners.get(event) ?? []
    handlers.push(callback as ListenerHandler)

    this.listeners.set(event, handlers)
  }

  public static emit<TEvent extends EventName> (event: TEvent, ...args: EventArgs<TEvent>): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener.call(this, ...args)
    }
  }
}

export function Subscribe<TEvent extends EventName> (event: TEvent): (listenerClass: ListenerClass<TEvent>) => void {
  return (listenerClass: ListenerClass<TEvent>): void => {
    EventBus.subscribe(event, listenerClass)
  }
}
