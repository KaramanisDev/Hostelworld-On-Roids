'use strict'

const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  experiments: {
    topLevelAwait: true
  },
  entry: {
    content: path.resolve(__dirname, '.', 'src/entries', 'content.ts')
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  cache: {
    type: 'filesystem'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
              happyPackMode: false
            }
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ],
    usedExports: true
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), 'dist/**/*'),
        `!${path.join(process.cwd(), 'dist/.keep')}`,
      ]
    }),
    new CopyPlugin({
      patterns: [{ from: '.', to: '.', context: 'src/assets' }]
    })
  ]
}
