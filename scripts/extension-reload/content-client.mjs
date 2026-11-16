import Extension from 'webextension-polyfill'

const pageReloadDelayInMs = 300

Extension.runtime.onMessage.addListener((message) => {
  if (message?.event !== 'extension:reload') return

  setTimeout(() => location.reload(), pageReloadDelayInMs)
})
