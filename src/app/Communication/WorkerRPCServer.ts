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

type IncomingRequest = {
  task: string
  payload: RPCRequestPayload
  tabId: number
  documentId?: string
}

export class WorkerRPCServer {
  private static readonly pendingRequests: Map<string, PendingRequest> = new Map()

  public static onRequest<TPayload, TResponse> (callback: OnRequestHandler<TPayload, TResponse>): void {
    this.listenForCancels()
    this.listenForClosedDocuments()

    ExtensionRuntime.onMessage<RPCRequestPayload>((
      message: string,
      payload: RPCRequestPayload,
      tabId?: number,
      documentId?: string
    ): void => {
      const task: string | null = RPCProtocol.requestedTask(message)
      if (!task || !tabId) return

      this.handleRequest({ task, payload, tabId, documentId }, callback)
    })
  }

  private static listenForCancels (): void {
    ExtensionRuntime.onMessage<RPCCancelPayload>((message: string, payload: RPCCancelPayload): void => {
      if (message !== RPCProtocol.cancelMessage) return

      this.cancelRequests(payload.ids)
    })
  }

  private static listenForClosedDocuments (): void {
    ExtensionRuntime.onPortDisconnect(RPCProtocol.documentPortName, (documentId?: string): void => {
      if (!documentId) return

      this.cancelRequests(
        [...this.pendingRequests]
          .filter(([, request]: [string, PendingRequest]) => request.documentId === documentId)
          .map(([id]: [string, PendingRequest]) => id)
      )
    })
  }

  private static cancelRequests (ids: string[]): void {
    for (const id of ids) {
      this.pendingRequests.get(id)?.controller.abort()
      this.forget(id)
    }
  }

  private static handleRequest<TPayload, TResponse> (
    request: IncomingRequest,
    callback: OnRequestHandler<TPayload, TResponse>
  ): void {
    const pendingRequest: PendingRequest = this.pendingRequests.get(request.payload.id) ?? {
      controller: new AbortController(),
      documentId: request.documentId
    }
    this.pendingRequests.set(request.payload.id, pendingRequest)

    const response: TResponse = callback(
      request.task,
      RPCSerializer.deserialize<TPayload>(request.payload.args),
      pendingRequest.controller.signal
    )

    if (response instanceof Promise) {
      void response.then(
        (result: TResponse): void => this.respond(request, result),
        (): void => this.forget(request.payload.id)
      )

      return
    }

    this.respond(request, response)
  }

  private static respond (request: IncomingRequest, result: unknown): void {
    this.forget(request.payload.id)
    const responsePayload: RPCResponsePayload = { id: request.payload.id, result: RPCSerializer.serialize(result) }

    ExtensionRuntime.sendMessageToTab(request.tabId, RPCProtocol.responseMessage(request.task), responsePayload)
  }

  private static forget (id: string): void {
    this.pendingRequests.delete(id)
  }
}
