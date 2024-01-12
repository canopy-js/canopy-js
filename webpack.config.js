const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    canopy: './client/canopy.js',
    playground: './playground/src.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'client/'),
      'node_modules'
    ],
    extensions: [ '.js' ],

    fallback: { "path": require.resolve("path-browserify") }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test:/\.(s*)css$/,
        use:['style-loader','css-loader', 'sass-loader']
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
      filename: "_[file].map"
    })
  ]
}
