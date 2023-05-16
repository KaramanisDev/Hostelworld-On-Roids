type UrlMatcher = RegExp | URL | string
type ResponseDecorator<T> = (url: string, response: T) => T

type Decorator = {
  url: UrlMatcher
  callback: ResponseDecorator<string>
}

export class XHRRequestInterceptor {
  private static decorators: Decorator[] = []

  public static init (): void {
    const originalResponseText: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
      XMLHttpRequest.prototype,
      'responseText'
    )

    const responseTextGetter: () => string = originalResponseText?.get || (() => '')
    const decorator: Function = this.decoratedResponseText.bind(this)

    Object.defineProperty(XMLHttpRequest.prototype, 'responseText', {
      get: function () {
        return decorator(this.responseURL, responseTextGetter.call(this))
      },
    })
  }

  public static addResponseDecorator (url: UrlMatcher, callback: ResponseDecorator<string>): void {
    const existingDecorator: Decorator | undefined = this.decorators.find(decorator => decorator.url === url)

    if (existingDecorator) {
      existingDecorator.callback = callback
    } else {
      this.decorators.push({ url, callback })
    }
  }

  private static decoratedResponseText (url: string, response: string): string {
    const matchedDecorators: Decorator[] = this.decorators.filter(decorator => {
      return decorator.url instanceof RegExp
        ? decorator.url.test(url)
        : url.includes(decorator.url.toString())
    })

    return matchedDecorators.reduce(
      (currentResponse: string, decorator: Decorator) => decorator.callback(url, currentResponse) || currentResponse,
      response
    )
  }
}
