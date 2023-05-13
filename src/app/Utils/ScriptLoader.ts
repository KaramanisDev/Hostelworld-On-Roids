import { hash } from './Utils'

export class ScriptLoader {
  public static async inject (url: string): Promise<void> {
    return new Promise((resolve: Function, reject: Function) => {
      if (this.isLoaded(url)) return resolve()

      const script: HTMLScriptElement = this.createScriptElement(url)
      document.documentElement.prepend(script)

      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Script could not be loaded.'))
    })
  }

  private static isLoaded (url: string): boolean {
    return !!document.querySelector(`#s${hash(url)}`)
  }

  private static createScriptElement (url: string): HTMLScriptElement {
    const script: HTMLScriptElement = document.createElement('script')
    script.src = url
    script.async = true
    script.id = `s${hash(url)}`
    script.type = 'text/javascript'

    return script
  }
}
