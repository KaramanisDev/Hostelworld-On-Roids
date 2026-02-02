'use strict'

module.exports = (api) => {
  api.cache(true)

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: '3',
          targets: '> 1%, not dead'
        }
      ]
    ],
    overrides: [
      {
        test: /\.tsx$/,
        presets: ['babel-preset-solid']
      }
    ]
  }
}
