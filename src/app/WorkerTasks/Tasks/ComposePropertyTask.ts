import type { WorkerTask, WorkerTaskResult } from './WorkerTask'
import { Search } from 'DTOs/Search'
import type { Property } from 'DTOs/Property'
import type { Property as HostelworldProperty } from 'Types/HostelworldSearch'
import { PropertyFactory } from 'Factories/PropertyFactory'
import { delay, promiseFallback } from 'Utils'

type PropertyId = number
type ComposePropertyJob = {
  search: Search
  property: HostelworldProperty
  promise: Promise<Property>
  resolve: (value: Property) => void;
  reject: (reason?: unknown) => void;
}

export class ComposePropertyTask implements WorkerTask {
  private isProcessing: boolean = false
  private readonly maxConcurrency: number = 3
  private readonly queue: Map<PropertyId, ComposePropertyJob> = new Map<PropertyId, ComposePropertyJob>()

  public handle (property: HostelworldProperty, search: Search): WorkerTaskResult<Property> {
    const { id } = property

    const queued: ComposePropertyJob | undefined = this.queue.get(id)
    if (queued) return queued.promise

    let resolvePromise!: (value: Property) => void
    let rejectPromise!: (reason?: unknown) => void
    const promiseToReturn: Promise<Property> = new Promise<Property>((resolve, reject) => {
      rejectPromise = reject
      resolvePromise = resolve
    })

    this.queue.set(id, { search, property, promise: promiseToReturn, resolve: resolvePromise, reject: rejectPromise })
    void promiseFallback(this.processQueue())

    return promiseToReturn
  }

  private async processQueue (): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      while (this.queue.size > 0) {
        const batch: ComposePropertyJob[] = []

        for (let index: number = 0; index < this.maxConcurrency && this.queue.size > 0; index++) {
          const [id, job]: [PropertyId, ComposePropertyJob] = this.queue.entries().next().value!
          this.queue.delete(id)

          batch.push(job)
        }

        await Promise.all(batch.map(async (job: ComposePropertyJob): Promise<void> => {
          const { search, property, resolve, reject } = job

          await PropertyFactory.create(property, search)
            .then(composed => resolve(composed))
            .catch(error => reject(error))
        }))

        await delay(360)
      }
    } finally {
      this.isProcessing = false
    }
  }
}
