module.exports = {
  env: {
    browser: true,
    es6: false,
    node: true
  },
  globals: {
    angular: true,
    _: true,
    $: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  }
};
