const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    canopy: './src/frontend/canopy.js',
    parser: './src/backend/parser/parser.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src/frontend/'),
      path.resolve(__dirname, 'src/backend/parser/'),
      'node_modules'
    ],
    extensions: [ '.js' ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },

  stats: { colors: true },
  node: {
   fs: "empty"
  },
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: "[file].map",
      exclude: ["parser.js"]
    })
  ]
}
