export interface StorageInterface<T = unknown> {
  put (key: string, payload: T, expiresAfterInMs?: number): Promise<void>

  get (key: string): Promise<T | undefined>

  hasNotExpired (key: string): Promise<boolean>
}
