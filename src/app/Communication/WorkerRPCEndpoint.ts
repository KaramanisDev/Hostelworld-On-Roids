import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import { RPCRequest, RPCResult } from './RPCTypesContract'

type OnRequestHandler<TPayload = unknown, TResponse = unknown> = (event: string, payload: TPayload) => TResponse

export class WorkerRPCEndpoint {
  public static listen (): void {
    window.addEventListener('rpc:call', async (eventInit: CustomEventInit<RPCRequest>): Promise<void> => {
      if (!eventInit.detail) return

      ExtensionRuntime.onMessageOnce((event: string, payload: unknown): void => {
        if (!event.endsWith(':response')) return

        const result: RPCResult = { task: event.replace(':response', ''), result: payload }

        window.dispatchEvent(
          new CustomEvent('rpc:result', { detail: result })
        )
      })

      const { task, args } = eventInit.detail
      const dispatchEvent = `${task}:request`

      ExtensionRuntime.sendMessage(dispatchEvent, args)
    })
  }

  public static onRequest<TPayload, TResponse> (callback: OnRequestHandler<TPayload, TResponse>): void {
    ExtensionRuntime.onMessage<TPayload>((event: string, payload: TPayload): void => {
      if (!event.endsWith(':request')) return

      const originalEvent: string = event.replace(':request', '')
      const response: TResponse = callback(originalEvent, payload)

      ExtensionRuntime.sendMessage(`${originalEvent}:response`, response)
    })
  }
}
