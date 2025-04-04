const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    canopy: './client/canopy.js',
    'playground/playground': './playground/src.js',
    rebuild_canopy: './client/rebuild_canopy.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Canopy',
    libraryTarget: 'umd'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'client/'),
      'node_modules'
    ],
    extensions: ['.js'],
    fallback: { "path": require.resolve("path-browserify") }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" }
      },
      {
        test: /\.(s*)css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.svg$/,
        loader: 'raw-loader'
      }
    ]
  },
  stats: { colors: true },
  target: 'web',
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'playground'),
          to: path.resolve(__dirname, 'dist/playground'),
          globOptions: {
            ignore: ['**/src.js', '**/default_text.js', '**/playground.scss']
          }
        }
      ]
    })
  ]
}
