'use strict'

import * as fs from 'fs'
import { execSync } from 'child_process'
import CopyPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ExtensionReloader from 'webpack-ext-reloader'
import { basePath } from './scripts/utils.mjs'

function aliases () {
  const aliases = {}
  const appDirectory = basePath('src/app')

  fs.readdirSync(appDirectory).forEach((directory) => {
    aliases[directory] = basePath(`src/app/${directory}`)
  })

  return aliases
}

function latestGitTag () {
  let latestGitTag = '0.0.0'
  try {
    latestGitTag = execSync('git describe --tags --abbrev=0').toString().trim()
  } catch {
    console.log('\x1b[33m%s\x1b[0m', `WARNING: Could not get git tag. Defaulting to version ${latestGitTag}`)
  }
  return latestGitTag
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
      patterns: [{
        from: '.',
        to: '.',
        context: 'src/assets/static',
        transform: (content, absoluteFilePath) => {
          if (!absoluteFilePath.endsWith('manifest.json')) return content

          const manifest = JSON.parse(content.toString())
          manifest.version = latestGitTag()

          return JSON.stringify(manifest, null, 2)
        }
      }]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new ExtensionReloader({
      manifest: basePath('src/assets/static/manifest.json')
    })
  ]
}
