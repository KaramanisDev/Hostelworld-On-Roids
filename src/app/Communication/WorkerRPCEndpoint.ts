import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import type {
  RPCCancelPayload,
  RPCRequest,
  RPCRequestPayload,
  RPCResponsePayload,
  RPCResult
} from './RPCTypesContract'
import { deserialize, serialize } from 'Utils'

type OnRequestHandler<TPayload = unknown, TResponse = unknown> = (
  event: string,
  payload: TPayload,
  signal: AbortSignal
) => TResponse

type PendingRequest = {
  controller: AbortController
  documentId?: string
}

export class WorkerRPCEndpoint {
  private static readonly documentPortName: string = 'rpc:document'
  private static readonly pendingRequests: Map<string, PendingRequest> = new Map()
  private static isDocumentPortOpen: boolean = false

  public static listen (): void {
    ExtensionRuntime.onMessage((event: string, payload: RPCResponsePayload): void => {
      if (!event.endsWith(':response')) return

      const result: RPCResult<string> = { id: payload.id, task: event.replace(':response', ''), result: payload.result }

      window.dispatchEvent(
        new CustomEvent('rpc:result', { detail: result })
      )
    })

    window.addEventListener('rpc:call', (eventInit: CustomEventInit<RPCRequest<string>>): void => {
      if (!eventInit.detail) return

      if (!ExtensionRuntime.isConnected()) {
        window.dispatchEvent(new CustomEvent('rpc:disconnected'))

        return
      }

      const { id, task, args } = eventInit.detail
      const dispatchEvent = `${task}:request`
      const payload: RPCRequestPayload = { id, args }

      this.openDocumentPort()
      ExtensionRuntime.sendMessage(dispatchEvent, payload)
    })

    window.addEventListener('rpc:cancel', (eventInit: CustomEventInit<RPCCancelPayload>): void => {
      if (!eventInit.detail || !ExtensionRuntime.isConnected()) return

      ExtensionRuntime.sendMessage('rpc:cancel', eventInit.detail)
    })
  }

  public static onRequest<TPayload, TResponse> (callback: OnRequestHandler<TPayload, TResponse>): void {
    ExtensionRuntime.onMessage<RPCCancelPayload>((event: string, payload: RPCCancelPayload): void => {
      if (event !== 'rpc:cancel') return

      this.cancelRequests(payload.ids)
    })

    ExtensionRuntime.onPortDisconnect(this.documentPortName, (documentId?: string): void => {
      if (!documentId) return

      this.cancelRequests(
        [...this.pendingRequests]
          .filter(([, request]: [string, PendingRequest]) => request.documentId === documentId)
          .map(([id]: [string, PendingRequest]) => id)
      )
    })

    ExtensionRuntime.onMessage<RPCRequestPayload>((
      event: string,
      payload: RPCRequestPayload,
      tabId?: number,
      documentId?: string
    ): void => {
      if (!event.endsWith(':request') || !tabId) return

      const originalEvent: string = event.replace(':request', '')
      const request: PendingRequest = this.pendingRequests.get(payload.id) ?? {
        controller: new AbortController(),
        documentId
      }
      this.pendingRequests.set(payload.id, request)

      const response: TResponse = callback(
        originalEvent,
        deserialize<TPayload>(payload.args),
        request.controller.signal
      )
      const respond: (result: TResponse) => void = (result: TResponse): void => {
        this.pendingRequests.delete(payload.id)
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

  private static openDocumentPort (): void {
    if (this.isDocumentPortOpen) return

    this.isDocumentPortOpen = true
    ExtensionRuntime.connect(this.documentPortName, (): void => {
      this.isDocumentPortOpen = false
    })
  }

  private static cancelRequests (ids: string[]): void {
    for (const id of ids) {
      this.pendingRequests.get(id)?.controller.abort()
      this.pendingRequests.delete(id)
    }
  }
}
