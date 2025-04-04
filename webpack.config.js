const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

class MovePlaygroundPlugin { // need this to happen after build creates playground.js asset
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MovePlaygroundPlugin', (compilation, callback) => {
      const asset = compilation.assets['playground.js'];
      if (asset) {
        compilation.assets['playground/playground.js'] = asset;
      }
      callback();
    });
  }
}

module.exports = {
  entry: {
    canopy: './client/canopy.js',
    playground: './playground/src.js',
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
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'playground'),
          to: path.resolve(__dirname, 'dist/playground')
        }
      ]
    }),
    new MovePlaygroundPlugin()
  ]
}
