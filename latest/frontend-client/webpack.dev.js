const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval',
  devServer: {
    host: 'localhost',
    headers: { 'Access-Control-Allow-Origin': '*' }, // fetching resource from separate origin (port)
    // 404 will fallback to index.html
    historyApiFallback: true,
    static: [
      {
        directory: path.resolve(__dirname, 'dist')
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    // removing pathinfo helps garbage collection in dev
    pathinfo: false
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  optimization: {
    runtimeChunk: 'single'
  }
});
