import type { ListenerInterface } from '../Listeners/ListenerInterface'

export class EventBus {
  private static listeners: { [event: string]: Function[] } = {}

  public static listen (events: string, callback: Function): void {
    events
      .split(' ')
      .forEach(event =>
        (this.listeners[event] = this.listeners[event] || []).push(callback)
      )
  }

  public static emit (events: string, ...args: unknown[]): void {
    events
      .split(' ')
      .forEach(event => this.execute(this.listeners[event] || [], args))
  }

  private static execute (listeners: Function[], args: unknown[]): void {
    if (!listeners) return

    listeners.forEach(async listener => await listener.call(this, ...args))
  }
}

export function Subscribe(events: string) {
  return <T extends { new (...args: any[]): ListenerInterface }>(listenerClass: T) => {
    const listener: ListenerInterface = new listenerClass()

    EventBus.listen(events, listener.handle.bind(listener))

    return listenerClass
  }
}
