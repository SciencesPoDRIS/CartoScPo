// webpack is only used to build the back office
// front office is build with gulp
const conf = require('config');
const webpack = require('webpack');

const config = {
  watch: process.env.NODE_ENV === 'development',
  entry: './back-office/index.js',
  output: {
    filename: './back-office/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
              plugins: ['transform-class-properties']
            }
          }
        ]
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/],
        use: [
          { loader: 'raw-loader' },
          {
            loader: 'html-minify-loader',
            options: {
              // set to true to keep comments
              comments: false
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      FRONT_OFFICE_BASEURL: JSON.stringify(conf.server.frontOfficeBaseUrl)
    })
  ]
};

if (process.env.ANALYZE_BUNDLE) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  config.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'webpack.report.html'
    })
  );
}

module.exports = config;
