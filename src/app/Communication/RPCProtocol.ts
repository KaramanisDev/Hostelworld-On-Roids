export class RPCProtocol {
  public static readonly callEvent: string = 'rpc:call'
  public static readonly resultEvent: string = 'rpc:result'
  public static readonly cancelEvent: string = 'rpc:cancel'
  public static readonly interruptedEvent: string = 'rpc:interrupted'
  public static readonly disconnectedEvent: string = 'rpc:disconnected'
  public static readonly cancelMessage: string = 'rpc:cancel'
  public static readonly documentPortName: string = 'rpc:document'
  private static readonly requestSuffix: string = ':request'
  private static readonly responseSuffix: string = ':response'

  public static requestMessage (task: string): string {
    return `${task}${this.requestSuffix}`
  }

  public static responseMessage (task: string): string {
    return `${task}${this.responseSuffix}`
  }

  public static requestedTask (message: string): string | null {
    return this.taskOf(message, this.requestSuffix)
  }

  public static respondedTask (message: string): string | null {
    return this.taskOf(message, this.responseSuffix)
  }

  private static taskOf (message: string, suffix: string): string | null {
    return message.endsWith(suffix) ? message.slice(0, -suffix.length) : null
  }
}
