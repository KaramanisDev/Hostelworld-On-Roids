'use strict'

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: '3',
        targets: '> 1%, not dead'
      }
    ]
  ]
}
