module.exports = {
  watch: true,
  entry: './back-office/index.js',
  output: {
    filename: './back-office/bundle.js',
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
            },
          },
        ],
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
              comments: false,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: false,
            },
          },
        ],
      },
    ],
  },
}
