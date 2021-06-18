const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('path');

const prodConfig = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: function (pathData) {
      return pathData.chunk.name === 'sysvars' ? '[name].js' : '[name].[contenthash].js';
    },
    publicPath: '/'
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ],
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        locales: {
          name: 'locales',
          test: /[\\/]src[\\/]i18n/,
          chunks: 'all'
        },
        coreVendors: {
          name: 'core-vendors',
          test: /[\\/]node_modules[\\/](react|react-dom|redux|react-redux|react-router|@material-ui|lodash)[\\/]/,
          chunks: 'all'
        }
      }
    }
  }
});
if (process.env.PROFILE) {
  // creates that zoomable treemap at port 8888, doesn't affect the bundle
  // disabled temporarily: it hangs the bamboo plan
  prodConfig.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

module.exports = prodConfig;
