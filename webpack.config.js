const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

//https://jlongster.com/Backend-Apps-with-Webpack--Part-I
var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: {
    canopy: './src/frontend/canopy.js',
    parser: './src/backend/parser/parser.js',
    server: './src/backend/server/server.js'
  },
  target: 'node',
  externals: nodeModules,
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
      exclude: ["parser.js", "server.js"]
    })
  ]
}
