/* global EXTENSION_RELOAD_URL */
import Extension from 'webextension-polyfill'

const reconnectDelayInMs = 1000

function connect () {
  const socket = new WebSocket(EXTENSION_RELOAD_URL)

  socket.addEventListener('message', () => void reloadExtension())
  socket.addEventListener('close', () => setTimeout(connect, reconnectDelayInMs))
}

async function reloadExtension () {
  const tabs = await Extension.tabs.query({})

  await Promise.allSettled(
    tabs.map(tab => Extension.tabs.sendMessage(tab.id, { event: 'extension:reload' }))
  )

  Extension.runtime.reload()
}

connect()
