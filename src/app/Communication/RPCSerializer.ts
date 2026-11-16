import { deserialize as deserializeAnything, serialize as serializeAnything } from 'serialize-anything'

type RequireContext = __WebpackModuleApi.RequireContext

export class RPCSerializer {
  public static serialize (input: unknown): string {
    return serializeAnything(input)
  }

  public static deserialize<T = unknown> (serializedInput: string): T {
    return deserializeAnything<T>(
      serializedInput,
      (className: string): T | undefined => this.dtoInstance<T>(className)
    )
  }

  private static dtoInstance<T> (className: string): T | undefined {
    const DtoClass: ClassConstructor<T> | undefined = this.dtoClasses()[className] as ClassConstructor<T> | undefined
    if (!DtoClass) return undefined

    return new DtoClass()
  }

  private static dtoClasses (): Record<string, ClassConstructor> {
    const context: RequireContext = require.context(
      '../DTOs',
      true,
      /^(?!.*(?:Abstract|Interface)).*\.ts$/,
      'sync'
    )
    const classes: Record<string, ClassConstructor> = {}

    for (const file of context.keys()) {
      const className: string = file.replace(/^\.\/(.+)\.ts$/, '$1')
      const exported: unknown = (context(file) as Record<string, unknown>)[className]
      if (typeof exported !== 'function') continue

      classes[className] = exported as ClassConstructor
    }

    return classes
  }
}
