import { waitForProperty } from 'Utils'

type NuxtDevice = {
  isMobile: boolean
  isMobileOrTablet: boolean
  [key: string]: unknown
}

export class DevicePatcher {
  public static async enforceMobile (): Promise<void> {
    const device: NuxtDevice = await waitForProperty<NuxtDevice>(window, '$nuxt.$device', 60_000)

    Object.defineProperty(device, 'isMobile', {
      configurable: true,
      get: () => true,
      set: () => undefined
    })

    Object.defineProperty(device, 'isMobileOrTablet', {
      configurable: true,
      get: () => true,
      set: () => undefined
    })
  }
}
