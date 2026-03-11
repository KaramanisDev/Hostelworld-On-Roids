type ConfigPayload = {
  name: string
  version: string
  homepage: string
  assets: {
    icon: string
  }
}

export class ExtensionConfig {
  private static cachedConfig: ConfigPayload | null = null
  private static readonly configAttribute: string = 'horConfig'

  public static init (payload: ConfigPayload): void {
    document.documentElement.dataset[this.configAttribute] = JSON.stringify(payload)
  }

  public static version (): string {
    return this.config().version
  }

  public static homepage (): string {
    return this.config().homepage
  }

  public static extensionName (): string {
    return this.config().name
  }

  public static asset (key: keyof ConfigPayload['assets']): string {
    return this.config().assets[key]
  }

  private static config (): ConfigPayload {
    if (this.cachedConfig) return this.cachedConfig

    const raw: string | undefined = document.documentElement.dataset[this.configAttribute]
    if (!raw) {
      throw new Error('Extension config was not initialized.')
    }

    this.cachedConfig = JSON.parse(raw) as ConfigPayload

    return this.cachedConfig
  }
}
