const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { ProvidePlugin } = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');
const env = require('node-env-file');

env(__dirname + '/.env.dist');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  context: __dirname,
  entry: {
    sysvars: './src/sysvars.ts',
    main: {
      dependOn: 'sysvars',
      import: ['./polyfills/index.js', 'react-hot-loader/patch', './src/index.tsx']
    }
  },
  resolve: {
    fallback: {
      // node module polyfills, required due to @react/renderer
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      zlib: 'browserify-zlib',
      assert: 'assert',
      fs: false,
      tls: false,
      net: false,
      path: false,
      http: false,
      https: false,
      crypto: false
    },
    extensions: ['.ts', '.tsx', '.js', '.scss', '.css', '.json'],
    plugins: [
      // copy paths from tsconfig and use it in wp module resolution
      new TsconfigPathsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        use: [
          'react-hot-loader/webpack',
          {
            loader: 'babel-loader?cacheDirectory'
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader?importLoaders=1',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.svg$/,
        type: 'asset/source'
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name]-[hash].[ext]'
        }
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name]-[hash].[ext]'
        }
      }
    ]
  },
  plugins: [
    // webpack 5 stopped providing node polyfills, but unfortunately
    // we need Buffer & util due to @react/renderer / PDFKit dependency
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body'
    }),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}'
      },
      typescript: { config: 'tsconfig.build.json' }
    }),
    new Dotenv({
      systemvars: true,
      path: './.env.dist'
    })
  ]
};
