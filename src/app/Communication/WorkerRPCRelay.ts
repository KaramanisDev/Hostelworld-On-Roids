import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import type { RPCCancelPayload, RPCRequest, RPCRequestPayload, RPCResponsePayload, RPCResult } from './RPCTypesContract'
import { RPCProtocol } from './RPCProtocol'

export class WorkerRPCRelay {
  private static isDocumentPortOpen: boolean = false

  public static listen (): void {
    ExtensionRuntime.onMessage((message: string, payload: RPCResponsePayload): void => {
      const task: string | null = RPCProtocol.respondedTask(message)
      if (!task) return

      const result: RPCResult<string> = { id: payload.id, task, result: payload.result }

      window.dispatchEvent(
        new CustomEvent(RPCProtocol.resultEvent, { detail: result })
      )
    })

    window.addEventListener(RPCProtocol.callEvent, (eventInit: CustomEventInit<RPCRequest<string>>): void => {
      if (!eventInit.detail) return

      if (!ExtensionRuntime.isConnected()) {
        window.dispatchEvent(new CustomEvent(RPCProtocol.disconnectedEvent))

        return
      }

      const { id, task, args } = eventInit.detail
      const payload: RPCRequestPayload = { id, args }

      this.openDocumentPort()
      ExtensionRuntime.sendMessage(RPCProtocol.requestMessage(task), payload)
    })

    window.addEventListener(RPCProtocol.cancelEvent, (eventInit: CustomEventInit<RPCCancelPayload>): void => {
      if (!eventInit.detail || !ExtensionRuntime.isConnected()) return

      ExtensionRuntime.sendMessage(RPCProtocol.cancelMessage, eventInit.detail)
    })
  }

  private static openDocumentPort (): void {
    if (this.isDocumentPortOpen) return

    this.isDocumentPortOpen = true
    ExtensionRuntime.connect(RPCProtocol.documentPortName, (): void => {
      this.isDocumentPortOpen = false

      window.dispatchEvent(new CustomEvent(RPCProtocol.interruptedEvent))
    })
  }
}
