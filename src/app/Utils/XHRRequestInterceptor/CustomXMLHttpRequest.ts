type BackingProperties<T> = {
  -readonly [K in keyof T]?: unknown
}

export class CustomXMLHttpRequest extends XMLHttpRequest {
  public url: string = ''
  public method: string = ''
  public backing: BackingProperties<this> = {}
  private static interceptCallback?: Function

  constructor () {
    super()
    CustomXMLHttpRequest.interceptCallback?.(this, 'construct')
  }

  public open (method: string, url: string): void;
  public open (method: string, url: string, async: boolean, username?: string | null, password?: string | null): void;
  public open (method: string, url: string, async?: boolean, username?: string | null, password?: string | null): void {
    this.url = url
    this.method = method

    CustomXMLHttpRequest.interceptCallback?.(this, 'open')

    return async === undefined
      ? super.open(this.method, this.url)
      : super.open(this.method, this.url, async, username, password)
  }

  public static setInterceptCallback (callback: Function): void {
    this.interceptCallback = callback
  }

  get onloadend (): ((event: ProgressEvent) => void) | null {
    return super.onloadend
  }

  set onloadend (callback: (event: ProgressEvent) => void | null) {
    super.onloadend = event => {
      CustomXMLHttpRequest.interceptCallback?.(this, 'loadend')
      callback?.(event)
    }
  }
}
