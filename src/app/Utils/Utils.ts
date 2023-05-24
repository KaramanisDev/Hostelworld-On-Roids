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

export async function waitForProperty<T = unknown> (rootProperty: Object, pathToWait: string, maxTimeout: number = 5000): Promise<T> {
  const path: string[] = pathToWait.split('.')
  const currentObj = path.reduce((obj: any, prop: string) => obj && obj[prop], rootProperty)

  if (currentObj !== undefined) return currentObj

  if (maxTimeout <= 0) {
    throw new Error(`${rootProperty} property path "${pathToWait}" is not available within the specified time.`)
  }

  await delay(100)
  return waitForProperty(rootProperty, pathToWait, maxTimeout - 100)
}

export function objectPick (object: Object, keys: string[]): Object {
  return Object.fromEntries(
    Object
      .entries(object)
      .filter(([key]) => keys.includes(key))
  )
}

export function objectsAreEqual (object1: Record<string, any>, object2: Record<string, any>): boolean {
  const object1Keys: string[] = Object.keys(object1)
  const object2Keys: string[] = Object.keys(object2)

  if (object1Keys.length !== object2Keys.length) return false

  for (const key of object1Keys) {
    if (object2Keys.includes(key) && object1[key] === object2[key]) continue

    return false
  }

  return true
}

export async function waitForElement (selector: string, maxTimeout: number = 5000): Promise<HTMLElement> {
  const element: HTMLElement | null = document.querySelector(selector)

  if (element) return element

  if (maxTimeout <= 0) {
    throw new Error(`Element that matches ${selector} was not found within the specified time.`)
  }

  await delay(100)
  return waitForElement(selector, maxTimeout - 100)
}

export function randomNumber (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function toPercent (value: number, max: number): number {
  if (!max) return 0

  return Number(
    (value / max * 100).toFixed(2)
  )
}
