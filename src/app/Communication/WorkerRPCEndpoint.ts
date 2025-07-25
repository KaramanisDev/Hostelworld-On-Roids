import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import { RPCRequest, RPCResult } from './RPCTypesContract'
import { deserialize, serialize } from 'Utils'

type OnRequestHandler<TPayload = unknown, TResponse = unknown> = (event: string, payload: TPayload) => TResponse

export class WorkerRPCEndpoint {
  public static listen (): void {
    ExtensionRuntime.onMessage((event: string, payload: string): void => {
      if (!event.endsWith(':response')) return

      const result: RPCResult = { task: event.replace(':response', ''), result: payload }

      window.dispatchEvent(
        new CustomEvent('rpc:result', { detail: result })
      )
    })

    window.addEventListener('rpc:call', async (eventInit: CustomEventInit<RPCRequest<string>>): Promise<void> => {
      if (!eventInit.detail) return

      const { task, args } = eventInit.detail
      const dispatchEvent = `${task}:request`

      ExtensionRuntime.sendMessage(dispatchEvent, args)
    })
  }

  public static onRequest<TPayload, TResponse> (callback: OnRequestHandler<TPayload, TResponse>): void {
    ExtensionRuntime.onMessage<string>((event: string, payload: string): void => {
      if (!event.endsWith(':request')) return

      const originalEvent: string = event.replace(':request', '')
      const response: TResponse = callback(originalEvent, deserialize<TPayload>(payload))

      if (response instanceof Promise) {
        void response.then(
          response => ExtensionRuntime.sendMessage(`${originalEvent}:response`, serialize(response))
        )

        return
      }

      ExtensionRuntime.sendMessage(`${originalEvent}:response`, serialize(response))
    })
  }
}
