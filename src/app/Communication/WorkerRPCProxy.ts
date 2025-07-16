import type { RPCRequest, RPCResult } from './RPCTypesContract'

type RPCResultHandler<T = unknown> = (event: string, response: T) => void

export class WorkerRPCProxy {
  public static call (task: string, args: unknown[]): void {
    const request: RPCRequest = { task, args }

    window.dispatchEvent(
      new CustomEvent('rpc:call', { detail: request })
    )
  }

  public static onResult<TResult = unknown> (callback: RPCResultHandler<TResult>): void {
    window.addEventListener('rpc:result', (eventInit: CustomEventInit<RPCResult<TResult>>): void => {
      if (!eventInit.detail) return

      const { task, result } = eventInit.detail
      callback(task, result)
    })
  }
}
