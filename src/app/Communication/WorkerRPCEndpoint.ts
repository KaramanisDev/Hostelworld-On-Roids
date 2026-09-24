import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import type { RPCRequest, RPCRequestPayload, RPCResponsePayload, RPCResult } from './RPCTypesContract'
import { deserialize, serialize } from 'Utils'

type OnRequestHandler<TPayload = unknown, TResponse = unknown> = (event: string, payload: TPayload) => TResponse

export class WorkerRPCEndpoint {
  public static listen (): void {
    ExtensionRuntime.onMessage((event: string, payload: RPCResponsePayload): void => {
      if (!event.endsWith(':response')) return

      const result: RPCResult<string> = { id: payload.id, task: event.replace(':response', ''), result: payload.result }

      window.dispatchEvent(
        new CustomEvent('rpc:result', { detail: result })
      )
    })

    window.addEventListener('rpc:call', async (eventInit: CustomEventInit<RPCRequest<string>>): Promise<void> => {
      if (!eventInit.detail) return

      const { id, task, args } = eventInit.detail
      const dispatchEvent = `${task}:request`
      const payload: RPCRequestPayload = { id, args }

      ExtensionRuntime.sendMessage(dispatchEvent, payload)
    })
  }

  public static onRequest<TPayload, TResponse> (callback: OnRequestHandler<TPayload, TResponse>): void {
    ExtensionRuntime.onMessage<RPCRequestPayload>((event: string, payload: RPCRequestPayload, tabId?: number): void => {
      if (!event.endsWith(':request') || !tabId) return

      const originalEvent: string = event.replace(':request', '')
      const response: TResponse = callback(originalEvent, deserialize<TPayload>(payload.args))
      const respond: (result: TResponse) => void = (result: TResponse): void => {
        const responsePayload: RPCResponsePayload = { id: payload.id, result: serialize(result) }

        ExtensionRuntime.sendMessageToTab(tabId, `${originalEvent}:response`, responsePayload)
      }

      if (response instanceof Promise) {
        void response.then(respond)

        return
      }

      respond(response)
    })
  }
}
