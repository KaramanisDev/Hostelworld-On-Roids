import { emptyFunction } from 'Utils'

type OriginalDescriptors = Map<PropertyKey, PropertyDescriptor | undefined>

export class ReactiveOverride {
  private static readonly originals: WeakMap<object, OriginalDescriptors> = new WeakMap()

  public static pin<T extends object, K extends keyof T> (target: T, property: K, value: T[K]): void {
    this.rememberOriginal(target, property)

    Object.defineProperty(target, property, {
      configurable: true,
      get: () => value,
      set: emptyFunction
    })
  }

  public static release<T extends object> (target: T, property: keyof T): void {
    const descriptors: OriginalDescriptors | undefined = this.originals.get(target)
    if (!descriptors?.has(property)) return

    const original: PropertyDescriptor | undefined = descriptors.get(property)
    descriptors.delete(property)

    if (!original) {
      Reflect.deleteProperty(target, property)
      return
    }

    Object.defineProperty(target, property, original)
  }

  private static rememberOriginal<T extends object> (target: T, property: keyof T): void {
    const descriptors: OriginalDescriptors = this.originals.get(target) ?? new Map()
    if (descriptors.has(property)) return

    descriptors.set(property, Object.getOwnPropertyDescriptor(target, property))
    this.originals.set(target, descriptors)
  }
}
