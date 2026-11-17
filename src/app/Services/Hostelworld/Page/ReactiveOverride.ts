import { emptyFunction } from 'Utils'

export class ReactiveOverride {
  public static pin<T extends object, K extends keyof T> (target: T, property: K, value: T[K]): void {
    Object.defineProperty(target, property, {
      configurable: true,
      get: () => value,
      set: emptyFunction
    })
  }
}
