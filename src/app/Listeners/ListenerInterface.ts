export interface ListenerInterface {
  handle (...args: [unknown]): Promise<void> | void
}
