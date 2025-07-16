export type WorkerTaskResult<T = unknown> = Promise<T> | T

export interface WorkerTask {
  handle (...args: unknown[]): WorkerTaskResult
}
