export function delay (timeoutInMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeoutInMs))
}

export function hash (input: string): string {
  let hash: number = 0

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash &= hash
  }

  return new Uint32Array([hash])[0].toString(36)
}

export async function waitForProperty (rootProperty: Object, pathToWait: string, maxTimeout: number = 5000): Promise<unknown> {
  const path: string[] = pathToWait.split('.')
  const currentObj = path.reduce((obj: any, prop: string) => obj && obj[prop], rootProperty)

  if (currentObj !== undefined) return currentObj

  if (maxTimeout <= 0) {
    throw new Error(`${rootProperty} property path "${pathToWait}" is not available within the specified time.`)
  }

  await delay(100)
  return waitForProperty(rootProperty, pathToWait, maxTimeout - 100)
}
