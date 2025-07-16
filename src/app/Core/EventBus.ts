import type { ListenerInterface, ListenerHandler } from 'Listeners/ListenerInterface'

type Listeners = Record<string, ListenerHandler[]>
type ListenerAttributes = Record<string, unknown>
type ListenerClass = new (attributes: ListenerAttributes) => ListenerInterface

export class EventBus {
  private static listeners: Listeners = {}
  private static listenerInitWithAttributes: ListenerAttributes = {}

  public static initWith (attributes: ListenerAttributes): void {
    this.listenerInitWithAttributes = attributes
  }

  public static subscribe (events: string, ListenerClass: ListenerClass): void {
    const listener: ListenerInterface = new ListenerClass(
      this.listenerInitWithAttributes
    )

    return this.listen(events, listener.handle.bind(listener))
  }

  public static listen (events: string, callback: ListenerHandler): void {
    const splitEvents: string[] = events.split(' ')

    for (const event of splitEvents) {
      (this.listeners[event] = this.listeners[event] || []).push(callback)
    }
  }

  public static emit (events: string, ...args: unknown[]): void {
    const splitEvents: string[] = events.split(' ')

    for (const event of splitEvents) {
      this.execute(this.listeners[event] || [], args)
    }
  }

  private static execute (listeners: ListenerHandler[], args: unknown[]): void {
    if (!listeners) return

    for (const listener of listeners) {
      listener.call(this, ...args)
    }
  }
}

export function Subscribe (events: string): <T extends ListenerClass>(listenerClass: T) => void {
  return <T extends ListenerClass>(listenerClass: T): void => {
    EventBus.subscribe(events, listenerClass)
  }
}
