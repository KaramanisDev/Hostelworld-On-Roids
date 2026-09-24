import type { RPCRequest, RPCResult } from './RPCTypesContract'
import { deserialize, serialize } from 'Utils'

type RPCResultHandler<T = unknown> = (event: string, response: T) => void

type PendingCall = {
  request: RPCRequest<string>
  attempts: number
}

export class WorkerRPCProxy {
  private static readonly resendAfterSilenceInMs: number = 30_000
  private static readonly silenceCheckIntervalInMs: number = 10_000
  private static readonly maxAttempts: number = 3
  private static readonly pendingCalls: Map<string, PendingCall> = new Map()
  private static lastActivityAt: number = 0
  private static silenceCheck: ReturnType<typeof setInterval> | null = null

  public static call (task: string, args: unknown[]): void {
    const request: RPCRequest<string> = { id: crypto.randomUUID(), task, args: serialize(args) }

    this.pendingCalls.set(request.id, { request, attempts: 1 })
    this.lastActivityAt = Date.now()
    this.send(request)
    this.watchForSilence()
  }

  public static onResult<TResult = unknown> (callback: RPCResultHandler<TResult>): void {
    window.addEventListener('rpc:result', (eventInit: CustomEventInit<RPCResult<string>>): void => {
      if (!eventInit.detail) return

      const { id, task, result } = eventInit.detail
      if (this.pendingCalls.get(id)?.request.task !== task) return

      this.pendingCalls.delete(id)
      this.lastActivityAt = Date.now()
      callback(task, deserialize<TResult>(result))
    })
  }

  private static send (request: RPCRequest<string>): void {
    window.dispatchEvent(
      new CustomEvent('rpc:call', { detail: request })
    )
  }

  private static watchForSilence (): void {
    if (this.silenceCheck) return

    this.silenceCheck = setInterval(() => this.resendAfterSilence(), this.silenceCheckIntervalInMs)
  }

  private static resendAfterSilence (): void {
    const resendableCalls: PendingCall[] = [...this.pendingCalls.values()]
      .filter((pendingCall: PendingCall): boolean => pendingCall.attempts < this.maxAttempts)

    if (!resendableCalls.length && this.silenceCheck) {
      clearInterval(this.silenceCheck)
      this.silenceCheck = null

      return
    }

    if (Date.now() - this.lastActivityAt < this.resendAfterSilenceInMs) return
    this.lastActivityAt = Date.now()

    for (const pendingCall of resendableCalls) {
      pendingCall.attempts++
      this.send(pendingCall.request)
    }
  }
}
