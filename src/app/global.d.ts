type Callback<T> = (value: T) => T
type ClassConstructor<T = unknown> = new (...args?: unknown[]) => T

interface Window {
  $nuxt: object
}

interface HTMLElement {
  __vue__?: object;
}

declare module 'serialize-anything' {
  function serialize (source: unknown, options?: { maxDepth?: number, pretty?: boolean }): string

  function deserialize<T = unknown> (
    serializedSource: string,
    customObjectClassFactory?: (className: string) => T | undefined
  ): T
}
