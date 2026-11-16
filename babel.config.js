'use strict'

module.exports = (api) => {
  api.cache(true)

  return {
    targets: 'chrome >= 111',
    presets: ['@babel/preset-env', '@babel/preset-typescript'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
      ['babel-plugin-polyfill-corejs3', { method: 'usage-global' }]
    ],
    overrides: [
      {
        test: /\.tsx$/,
        presets: ['babel-preset-solid']
      }
    ]
  }
}
