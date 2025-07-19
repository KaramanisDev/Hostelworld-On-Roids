import type { CustomXMLHttpRequest } from './CustomXMLHttpRequest'
import { emptyFunction, objectPick } from '..'

type Modifier = (request: CustomXMLHttpRequest) => void

type ModifierName = 'withUrl' | 'withTimeout' | 'withResponse' | 'shouldNotFailOpen' | 'shouldNotFailLoadEnd'
type Stages = {
  open: ModifierName[]
  loadend: ModifierName[]
}

type RequestProperty = keyof CustomXMLHttpRequest

type Modifiers = {
  [modifierKey in ModifierName]?: Modifier
}

export type InterceptionStage = keyof Stages

export class RequestModifier {
  private readonly modifiers: Modifiers = {}
  private readonly stages: Stages = {
    open: ['withUrl', 'withTimeout', 'shouldNotFailOpen'],
    loadend: ['withResponse', 'shouldNotFailLoadEnd']
  }

  public withUrl (urlOrCallback: string | Callback<string>): this {
    this.modifiers.withUrl = (request: CustomXMLHttpRequest): void => {
      const url: string = request.url
      const newUrl: string = typeof urlOrCallback === 'function'
        ? urlOrCallback(url)
        : urlOrCallback

      this.onPropertyEnforce(request, 'url', newUrl)
    }

    return this
  }

  public withResponse (responseOrCallback: string | Callback<string>): this {
    this.modifiers.withResponse = (request: CustomXMLHttpRequest): void => {
      const response: string = request.responseText
      const newResponse: string = typeof responseOrCallback === 'function'
        ? responseOrCallback(response)
        : responseOrCallback

      this.onPropertyEnforce(request, 'responseText', newResponse)
    }

    return this
  }

  public withTimeout (newTimeout: number): this {
    this.modifiers.withTimeout = (request: CustomXMLHttpRequest): void => {
      this.onPropertyEnforce(request, 'timeout', newTimeout)
    }

    return this
  }

  public shouldNotFail (respondWithIfFailed?: string): this {
    this.modifiers.shouldNotFailOpen = (request: CustomXMLHttpRequest): void => {
      this.onPropertyEnforce(request, 'onabort', emptyFunction)
      this.onPropertyEnforce(request, 'onerror', emptyFunction)
      this.onPropertyEnforce(request, 'ontimeout', emptyFunction)
    }

    this.modifiers.shouldNotFailLoadEnd = (request: CustomXMLHttpRequest): void => {
      if (request.status === 200) return

      this.onPropertyEnforce(request, 'status', 200)

      if (!respondWithIfFailed) return
      this.onPropertyEnforce(request, 'responseText', respondWithIfFailed)
    }

    return this
  }

  public applyTo (request: CustomXMLHttpRequest, stage: InterceptionStage): void {
    const modifiers: Modifier[] = Object.values(
      objectPick(this.modifiers, this.stages[stage] || [])
    )

    for (const modifier of modifiers) {
      modifier(request)
    }
  }

  private onPropertyEnforce (
    request: CustomXMLHttpRequest,
    property: RequestProperty,
    value: unknown,
    disallowSet: boolean = true
  ): void {
    request.backing[property] = request[property]

    Object.defineProperty(request, property, {
      get: () => {
        request.backing[property] = value || request.backing[property]

        return request.backing[property]
      },
      set: (newValue: unknown) => {
        if (disallowSet) return

        request.backing[property] = newValue
      }
    })
  }
}
