import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import { ExtensionConfig } from 'Utils/ExtensionConfig'
import { WorkerRPCRelay } from 'Communication/WorkerRPCRelay'

export class ContentInitializer {
  public static async init (): Promise<void> {
    WorkerRPCRelay.listen()

    ExtensionConfig.init(
      {
        name: ExtensionRuntime.manifestName(),
        version: ExtensionRuntime.manifestVersion(),
        homepage: ExtensionRuntime.manifestHomepage(),
        assets: {
          icon: ExtensionRuntime.assetUrl('icons/icon32.png')
        }
      }
    )
  }
}
