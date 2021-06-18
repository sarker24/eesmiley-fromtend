/**
 * Created by lude on 31/03/2017.
 */
var path = require('path');
module.exports = {
  components: 'src/components/**/*.tsx',
  propsParser: require('react-docgen-typescript').parse,
  ignore: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',

    /* CUSTOM */
    '**/app/index.tsx',
    '**/log/index.tsx'
  ],

  webpackConfig: Object.assign({}, require('./webpack.prod'), {
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.scss', '.css'],
      modules: [
        path.resolve('./src/components'),
        path.resolve('./src/pages'),
        path.resolve('./src'),
        path.resolve('./node_modules'),
        path.resolve('./src/static')
      ],
      alias: {
        'rsg-components/Wrapper': path.join(__dirname, 'lib/styleguide/wrapper.tsx')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|bower_components),test/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                transpileOnly: true,
                silent: true,
                configFileName: 'tsconfig-style.json'
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader?importLoaders=1']
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader?importLoaders=1',
            'postcss-loader',
            'sass-loader?includePaths[]=./node_modules'
          ]
        },
        {
          test: /\.svg$/,
          type: 'asset/source'
        }
      ]
    }
  })
};
