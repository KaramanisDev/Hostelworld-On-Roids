type ResizeListener = () => void

type SensorWindow = {
  addEventListener: (type: string, listener: ResizeListener) => void
  removeEventListener: (type: string, listener: ResizeListener) => void
}

type SensorDocument = {
  defaultView: SensorWindow
}

export class ResizeObserverComponentPatcher {
  private static readonly sensorUrl: string = 'about:blank'
  private static readonly sensorType: string = 'text/html'
  private static readonly resizeEvent: string = 'resize'
  private static readonly loadEvent: string = 'load'

  public static useNativeObserver (): void {
    const dataProperty: PropertyDescriptor = Object.getOwnPropertyDescriptor(HTMLObjectElement.prototype, 'data')!

    Object.defineProperty(HTMLObjectElement.prototype, 'data', {
      ...dataProperty,
      get (this: HTMLObjectElement): string {
        return dataProperty.get!.call(this)
      },
      set (this: HTMLObjectElement, url: string): void {
        const isSensor: boolean = ResizeObserverComponentPatcher.isResizeSensor(this, url)
        if (isSensor) return ResizeObserverComponentPatcher.observe(this)

        dataProperty.set!.call(this, url)
      }
    })
  }

  private static isResizeSensor (object: HTMLObjectElement, url: string): boolean {
    return url === this.sensorUrl && object.type === this.sensorType && object.getAttribute('aria-hidden') === 'true'
  }

  private static observe (sensor: HTMLObjectElement): void {
    const sensorDocument: SensorDocument = { defaultView: this.sensorWindow(sensor) }

    Object.defineProperty(sensor, 'contentDocument', {
      configurable: true,
      get: (): SensorDocument => sensorDocument
    })

    setTimeout((): void => sensor.onload?.(new Event(this.loadEvent)))
  }

  private static sensorWindow (sensor: HTMLObjectElement): SensorWindow {
    const listeners: Set<ResizeListener> = new Set()
    const observer: ResizeObserver = new ResizeObserver((): void => {
      listeners.forEach((listener: ResizeListener): void => listener())
    })

    return {
      addEventListener: (type: string, listener: ResizeListener): void => {
        if (type !== this.resizeEvent) return

        if (!listeners.size) observer.observe(sensor)
        listeners.add(listener)
      },
      removeEventListener: (type: string, listener: ResizeListener): void => {
        if (type !== this.resizeEvent) return

        listeners.delete(listener)
        if (!listeners.size) observer.disconnect()
      }
    }
  }
}
