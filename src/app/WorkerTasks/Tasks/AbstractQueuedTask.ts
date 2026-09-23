import type { WorkerTask, WorkerTaskResult } from './WorkerTask'
import { delay } from 'Utils'

type JobId = string | number

type Job<TArgs, TResult> = {
  id: JobId
  args: TArgs
  promise: Promise<TResult>
  resolve: (value: TResult) => void
  reject: (reason?: unknown) => void
}

export abstract class AbstractQueuedTask<TArgs, TResult> implements WorkerTask {
  private runningJobs: number = 0
  private readonly maxConcurrency: number = 4
  private readonly pauseAfterJobInMs: number = 200
  private readonly queue: Map<JobId, Job<TArgs, TResult>> = new Map()

  protected abstract jobId (args: TArgs): JobId
  protected abstract execute (args: TArgs): Promise<TResult>

  public handle (...args: unknown[]): WorkerTaskResult<TResult> {
    const typedArgs: TArgs = args as unknown as TArgs
    const id: JobId = this.jobId(typedArgs)

    const existing: Job<TArgs, TResult> | undefined = this.queue.get(id)
    if (existing) return existing.promise

    let resolvePromise!: (value: TResult) => void
    let rejectPromise!: (reason?: unknown) => void
    const promise: Promise<TResult> = new Promise<TResult>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    })

    this.queue.set(id, { id, args: typedArgs, promise, resolve: resolvePromise, reject: rejectPromise })
    this.startQueuedJobs()

    return promise
  }

  private startQueuedJobs (): void {
    while (this.runningJobs < this.maxConcurrency && this.queue.size > 0) {
      const [id, job]: [JobId, Job<TArgs, TResult>] = this.queue.entries().next().value!
      this.queue.delete(id)
      this.runningJobs++

      void this.runJob(job)
    }
  }

  private async runJob (job: Job<TArgs, TResult>): Promise<void> {
    try {
      const result: TResult = await this.execute(job.args)
      job.resolve(result)
    } catch (error) {
      job.reject(error)
    } finally {
      await delay(this.pauseAfterJobInMs)
      this.runningJobs--
      this.startQueuedJobs()
    }
  }
}
