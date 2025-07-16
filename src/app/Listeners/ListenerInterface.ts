export type ListenerHandler = (...args: unknown[]) => void | Promise<void>

export interface ListenerInterface {
  handle (...args: unknown[]): Promise<void> | void
}
