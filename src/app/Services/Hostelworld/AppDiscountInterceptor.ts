import { XHRRequestInterceptor } from 'Utils/XHRRequestInterceptor'

export class AppDiscountInterceptor {
  private static applicationParamRegex: RegExp = /application=(?!mobile)\w+/

  public static enableAppDiscounts (): void {
    XHRRequestInterceptor
      .intercept({ url: this.applicationParamRegex })
      .withUrl((url: string): string => {
        const parsed: URL = new URL(url)
        parsed.searchParams.set('application', 'mobile')

        return parsed.toString()
      })
  }
}
