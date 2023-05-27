import { ScriptLoader } from 'Utils/ScriptLoader'
import { ExtensionRuntime } from 'Utils/ExtensionRuntime'

export class ContentInitializer {
  public static async init (): Promise<void> {
    /*
     Why? you wonder?
     Well in order to have access to the window attributes to be able to do things like intercepting XHR requests etc...
     You'll need your script to run in the page itself, and not within the content scripts of the extension.

     Additional benefits it offers is that we won't have to reload the extension in the browser on every build.
    */
    return ScriptLoader.inject(
      ExtensionRuntime.assetUrl('roids.js')
    )
  }
}
