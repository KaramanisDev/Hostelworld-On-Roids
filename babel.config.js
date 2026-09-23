'use strict'

module.exports = (api) => {
  api.cache(true)

  return {
    targets: '> 1%, not dead',
    presets: ['@babel/preset-env'],
    plugins: [
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
