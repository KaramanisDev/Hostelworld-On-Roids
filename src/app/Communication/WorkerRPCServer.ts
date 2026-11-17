import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import type { RPCCancelPayload, RPCRequestPayload, RPCResponsePayload } from './RPCTypesContract'
import { RPCProtocol } from './RPCProtocol'
import { RPCSerializer } from './RPCSerializer'

type OnRequestHandler<TPayload = unknown, TResponse = unknown> = (
  task: string,
  payload: TPayload,
  signal: AbortSignal
) => TResponse

type PendingRequest = {
  controller: AbortController
  documentId?: string
}

export class WorkerRPCServer {
  private static readonly pendingRequests: Map<string, PendingRequest> = new Map()

  public static onRequest<TPayload, TResponse> (callback: OnRequestHandler<TPayload, TResponse>): void {
    ExtensionRuntime.onMessage<RPCCancelPayload>((message: string, payload: RPCCancelPayload): void => {
      if (message !== RPCProtocol.cancelMessage) return

      this.cancelRequests(payload.ids)
    })

    ExtensionRuntime.onPortDisconnect(RPCProtocol.documentPortName, (documentId?: string): void => {
      if (!documentId) return

      this.cancelRequests(
        [...this.pendingRequests]
          .filter(([, request]: [string, PendingRequest]) => request.documentId === documentId)
          .map(([id]: [string, PendingRequest]) => id)
      )
    })

    ExtensionRuntime.onMessage<RPCRequestPayload>((
      message: string,
      payload: RPCRequestPayload,
      tabId?: number,
      documentId?: string
    ): void => {
      const task: string | null = RPCProtocol.requestedTask(message)
      if (!task || !tabId) return

      const request: PendingRequest = this.pendingRequests.get(payload.id) ?? {
        controller: new AbortController(),
        documentId
      }
      this.pendingRequests.set(payload.id, request)

      const response: TResponse = callback(
        task,
        RPCSerializer.deserialize<TPayload>(payload.args),
        request.controller.signal
      )
      const respond: (result: TResponse) => void = (result: TResponse): void => {
        this.pendingRequests.delete(payload.id)
        const responsePayload: RPCResponsePayload = { id: payload.id, result: RPCSerializer.serialize(result) }

        ExtensionRuntime.sendMessageToTab(tabId, RPCProtocol.responseMessage(task), responsePayload)
      }

      if (response instanceof Promise) {
        void response.then(respond)

        return
      }

      respond(response)
    })
  }

  private static cancelRequests (ids: string[]): void {
    for (const id of ids) {
      this.pendingRequests.get(id)?.controller.abort()
      this.pendingRequests.delete(id)
    }
  }
}
