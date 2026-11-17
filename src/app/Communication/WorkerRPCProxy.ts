import type { RPCCancelPayload, RPCRequest, RPCResult } from './RPCTypesContract'
import { RPCSerializer } from './RPCSerializer'
import { RPCProtocol } from './RPCProtocol'
import type { WorkerTaskArgs, WorkerTaskName, WorkerTaskPayload } from 'WorkerTasks/WorkerTaskCatalogue'

type PendingCall = {
  request: RPCRequest<string>
  attempts: number
  resolve: (result: unknown) => void
}

export class WorkerRPCProxy {
  private static readonly resendAfterSilenceInMs: number = 30_000
  private static readonly silenceCheckIntervalInMs: number = 10_000
  private static readonly maxAttempts: number = 3
  private static readonly pendingCalls: Map<string, PendingCall> = new Map()
  private static lastActivityAt: number = 0
  private static silenceCheck: ReturnType<typeof setInterval> | null = null
  private static isDisconnected: boolean = false
  private static areListenersInstalled: boolean = false

  public static call<TTask extends WorkerTaskName> (
    task: TTask,
    ...args: WorkerTaskArgs<TTask>
  ): Promise<WorkerTaskPayload<TTask>> {
    return new Promise((resolve: (result: WorkerTaskPayload<TTask>) => void): void => {
      if (this.isDisconnected) return

      this.installListeners()

      const request: RPCRequest<string> = { id: crypto.randomUUID(), task, args: RPCSerializer.serialize(args) }

      this.pendingCalls.set(request.id, { request, attempts: 1, resolve: resolve as (result: unknown) => void })
      this.lastActivityAt = Date.now()
      this.send(request)
      this.watchForSilence()
    })
  }

  public static cancelPending (): void {
    if (!this.pendingCalls.size) return

    const payload: RPCCancelPayload = { ids: [...this.pendingCalls.keys()] }
    this.pendingCalls.clear()

    window.dispatchEvent(
      new CustomEvent(RPCProtocol.cancelEvent, { detail: payload })
    )
  }

  public static onDisconnect (callback: () => void): void {
    window.addEventListener(RPCProtocol.disconnectedEvent, (): void => {
      if (this.isDisconnected) return

      this.isDisconnected = true
      this.pendingCalls.clear()
      callback()
    })
  }

  private static installListeners (): void {
    if (this.areListenersInstalled) return
    this.areListenersInstalled = true

    window.addEventListener(RPCProtocol.resultEvent, (eventInit: CustomEventInit<RPCResult<string>>): void => {
      if (eventInit.detail) this.deliver(eventInit.detail)
    })
    window.addEventListener('pageshow', (event: PageTransitionEvent): void => {
      if (!event.persisted) return

      this.resendPending()
    })
    window.addEventListener(RPCProtocol.interruptedEvent, (): void => this.resendPending())
  }

  private static deliver (result: RPCResult<string>): void {
    const pendingCall: PendingCall | undefined = this.pendingCalls.get(result.id)
    if (pendingCall?.request.task !== result.task) return

    this.pendingCalls.delete(result.id)
    this.lastActivityAt = Date.now()
    pendingCall.resolve(RPCSerializer.deserialize(result.result))
  }

  private static send (request: RPCRequest<string>): void {
    window.dispatchEvent(
      new CustomEvent(RPCProtocol.callEvent, { detail: request })
    )
  }

  private static resendPending (): void {
    this.lastActivityAt = Date.now()

    for (const pendingCall of this.pendingCalls.values()) {
      this.send(pendingCall.request)
    }
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
