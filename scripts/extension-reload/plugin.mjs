import webpack from 'webpack'
import { WebSocketServer } from 'ws'
import { basePath, logInfo } from '../utils.mjs'

const pluginName = 'ExtensionReloadPlugin'
const reloadPort = 9090

export class ExtensionReloadPlugin {
  apply (compiler) {
    if (!compiler.options.watch) return

    this.addClient(compiler, 'worker', 'worker-client.mjs')
    this.addClient(compiler, 'content', 'content-client.mjs')
    new webpack.DefinePlugin({
      EXTENSION_RELOAD_URL: JSON.stringify(`ws://localhost:${reloadPort}`)
    }).apply(compiler)

    const server = new WebSocketServer({ port: reloadPort })

    compiler.hooks.done.tap(pluginName, (stats) => {
      if (stats.hasErrors()) return

      for (const client of server.clients) {
        client.send('reload')
      }
      logInfo(`Extension reload sent to ${server.clients.size} client(s).`)
    })
    compiler.hooks.watchClose.tap(pluginName, () => server.close())
  }

  addClient (compiler, entryName, clientFile) {
    new webpack.EntryPlugin(
      compiler.context,
      basePath(`scripts/extension-reload/${clientFile}`),
      { name: entryName }
    ).apply(compiler)
  }
}
