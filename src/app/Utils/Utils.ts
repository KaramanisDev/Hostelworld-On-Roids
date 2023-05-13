export function delay(timeoutInMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeoutInMs))
}

export function hash(input: string): string {
  let hash:number = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }

  return new Uint32Array([hash])[0].toString(36)
}
