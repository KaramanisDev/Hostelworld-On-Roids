import type { CustomXMLHttpRequest } from './CustomXMLHttpRequest'

type Callback<T> = (propertyValue: T) => T
type Interceptions = {
  status?: Callback<number>
  responseText?: Callback<string>,
}

export class InterceptedRequest {
  private interceptions: Interceptions = {}

  public withResponse (responseOrCallback: string | Callback<string>): this {
    this.interceptions.responseText = (responseText: string): string => {
      return typeof responseOrCallback === 'function'
        ? responseOrCallback(responseText)
        : responseOrCallback
    }

    return this
  }

  public withStatus (newStatus: number): this {
    this.interceptions.status = (status: number = newStatus): number => status

    return this
  }

  public applyInterceptions (request: CustomXMLHttpRequest): void {
    for (const [property, callback] of Object.entries(this.interceptions)) {
      const originalValue: unknown = request[property as keyof CustomXMLHttpRequest]

      const interceptTo: Function = callback.bind(this)

      Object.defineProperty(request, property, {
        get: function () {
          const newValue: unknown = interceptTo(originalValue)

          return typeof newValue === 'undefined'
            ? originalValue
            : newValue
        }
      })
    }
  }
}
