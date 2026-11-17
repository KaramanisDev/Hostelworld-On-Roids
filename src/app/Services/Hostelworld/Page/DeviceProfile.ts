import { NuxtApp } from './NuxtApp'
import { ReactiveOverride } from './ReactiveOverride'
import type { NuxtDevice } from './HostelworldVueTypes'

export class DeviceProfile {
  public static async enforceMobile (): Promise<void> {
    const device: NuxtDevice = await NuxtApp.device()

    ReactiveOverride.pin(device, 'isMobile', true)
    ReactiveOverride.pin(device, 'isMobileOrTablet', true)
  }
}
