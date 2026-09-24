import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import { promiseFallback } from 'Utils'

export class WorkerKeepAlive {
  private static readonly extendIntervalInMs: number = 20_000
  private static holders: number = 0
  private static extender: ReturnType<typeof setInterval> | null = null

  public static hold (): void {
    this.holders++
    this.extender ??= setInterval(() => void promiseFallback(ExtensionRuntime.platformInfo()), this.extendIntervalInMs)
  }

  public static release (): void {
    this.holders = Math.max(0, this.holders - 1)
    if (this.holders || !this.extender) return

    clearInterval(this.extender)
    this.extender = null
  }
}
