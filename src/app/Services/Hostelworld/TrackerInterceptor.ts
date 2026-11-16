type ChromeWindow = Window & {
  chrome?: {
    runtime?: {
      id?: string
    }
  }
}

export class TrackerInterceptor {
  private static readonly blockedScriptType: string = 'javascript/blocked'
  private static readonly sentryDisablingRuntimeId: string = 'hostelworld-on-roids'
  private static readonly blockedResponseStatus: number = 204
  private static readonly guardedWindows: WeakSet<Window> = new WeakSet()
  private static readonly blocklist: string[] = [
    'googletagmanager.com',
    'google-analytics.com',
    'googlesyndication.com',
    'googleadservices.com',
    'doubleclick.net',
    'trustarc.com',
    'survicate.com',
    'sentry.io',
    'segment.com',
    'segment.io',
    'sprig.com',
    'btncdn.com',
    'analytics.ahrefs.com',
    'hotjar.com',
    'hotjar.io',
    'clarity.ms',
    'bat.bing.com',
    'analytics.tiktok.com'
  ]

  public static blockTrackers (): void {
    this.blockScriptSources()
    this.blockParsedScripts()
    this.blockNetworkCalls()
    this.disableSentry()
  }

  private static blockScriptSources (): void {
    const sourceProperty: PropertyDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')!
    const originalSetAttribute: Element['setAttribute'] = HTMLScriptElement.prototype.setAttribute

    Object.defineProperty(HTMLScriptElement.prototype, 'src', {
      ...sourceProperty,
      get (this: HTMLScriptElement): string {
        return sourceProperty.get!.call(this)
      },
      set (this: HTMLScriptElement, url: string): void {
        if (TrackerInterceptor.isTracker(url)) return

        sourceProperty.set!.call(this, url)
      }
    })

    HTMLScriptElement.prototype.setAttribute = function (this: HTMLScriptElement, name: string, value: string): void {
      const isTrackerSource: boolean = name.toLowerCase() === 'src' && TrackerInterceptor.isTracker(value)
      if (isTrackerSource) return

      originalSetAttribute.call(this, name, value)
    }
  }

  private static blockParsedScripts (): void {
    new MutationObserver((mutations: MutationRecord[]): void => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLScriptElement) || !this.isTracker(node.src)) continue

          node.type = this.blockedScriptType
          node.remove()
        }
      }
    }).observe(document, { childList: true, subtree: true })
  }

  private static blockNetworkCalls (): void {
    this.guardWindow(window)

    const contentWindowProperty: PropertyDescriptor =
      Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')!

    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      ...contentWindowProperty,
      get (this: HTMLIFrameElement): Window | null {
        const frameWindow: Window | null = contentWindowProperty.get!.call(this)
        if (frameWindow) TrackerInterceptor.guardWindow(frameWindow)

        return frameWindow
      }
    })
  }

  private static guardWindow (target: Window): void {
    if (this.guardedWindows.has(target) || !this.isScriptable(target)) return
    this.guardedWindows.add(target)

    const originalFetch: typeof window.fetch = target.fetch.bind(window)
    const originalSendBeacon: Navigator['sendBeacon'] = target.navigator.sendBeacon.bind(target.navigator)

    target.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url: string = typeof input === 'object' && 'url' in input ? input.url : String(input)
      if (this.isTracker(url)) return Promise.resolve(new Response(null, { status: this.blockedResponseStatus }))

      return originalFetch(input, init)
    }

    target.navigator.sendBeacon = (url: string | URL, data?: BodyInit | null): boolean => {
      if (this.isTracker(String(url))) return true

      return originalSendBeacon(url, data)
    }
  }

  private static disableSentry (): void {
    const chromeWindow: ChromeWindow = window

    chromeWindow.chrome ??= {}
    chromeWindow.chrome.runtime ??= {}
    chromeWindow.chrome.runtime.id ??= this.sentryDisablingRuntimeId
  }

  private static isTracker (url: string): boolean {
    const host: string | null = this.hostOf(url)
    if (!host) return false

    return this.blocklist.some((blocked: string): boolean => host === blocked || host.endsWith(`.${blocked}`))
  }

  private static isScriptable (target: Window): boolean {
    try {
      return typeof target.fetch === 'function'
    } catch {
      return false
    }
  }

  private static hostOf (url: string): string | null {
    try {
      return new URL(url, location.href).hostname
    } catch {
      return null
    }
  }
}
