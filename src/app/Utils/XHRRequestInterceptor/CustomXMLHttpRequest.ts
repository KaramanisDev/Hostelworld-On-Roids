export class CustomXMLHttpRequest extends XMLHttpRequest {
  public method: string = ''
  private static customLoadEndCallback?: Function

  public open (method: string, url: string): void;
  public open (method: string, url: string, async: boolean, username?: string | null, password?: string | null): void;
  public open (method: string, url: string, async?: boolean, username?: string | null, password?: string | null): void {
    this.method = method

    return async === undefined
      ? super.open(method, url)
      : super.open(method, url, async, username, password)
  }

  public static setCustomLoadEndCallback (callback: Function): void {
    this.customLoadEndCallback = callback
  }

  set onloadend(callback: (event: ProgressEvent) => void | null) {
    super.onloadend = event => {
      CustomXMLHttpRequest.customLoadEndCallback?.(this)
      callback?.(event)
    };
  }
}
