import { ExtensionRuntime } from 'Utils/ExtensionRuntime'
import { ExtensionConfig } from 'Utils/ExtensionConfig'
import { WorkerRPCEndpoint } from 'Communication/WorkerRPCEndpoint'

export class ContentInitializer {
  public static async init (): Promise<void> {
    WorkerRPCEndpoint.listen()

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
