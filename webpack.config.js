const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  experiments: {
    topLevelAwait: true
  },
  entry: {
    content: path.resolve(__dirname, '.', 'src/entries', 'content.ts')
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
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
              transpileOnly: true
            }
          },
        ],
      },
    ],
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
    }),
  ],
}
