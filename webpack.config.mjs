'use strict'

import url from 'url'
import path from 'path'
import * as fs from 'fs'
import CopyPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function basePath (relative) {
  return path.resolve(__dirname, relative)
}

function aliases () {
  const aliases = {}
  const appDirectory = basePath('src/app')

  fs.readdirSync(appDirectory).forEach((directory) => {
    aliases[directory] = basePath(`src/app/${directory}`)
  })

  return aliases
}

export default {
  mode: 'development',
  devtool: 'source-map',
  experiments: {
    topLevelAwait: true
  },
  entry: {
    roids: [
      basePath('src/entries/app.ts'),
      basePath('src/assets/styles/app.scss')
    ],
    worker: basePath('src/entries/worker.ts'),
    content: basePath('src/entries/content.ts')
  },
  output: {
    filename: '[name].js',
    path: basePath('dist')
  },
  resolve: {
    alias: aliases(),
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
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
              happyPackMode: false
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    usedExports: true,
    minimizer: [new TerserPlugin({ extractComments: false, terserOptions: { keep_classnames: true } })]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        basePath('dist/**/*'),
        `!${basePath('dist/.keep')}`
      ]
    }),
    new CopyPlugin({
      patterns: [{ from: '.', to: '.', context: 'src/assets/static' }]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
}
