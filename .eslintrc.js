const path = require('path')


module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.join(__dirname, './tsconfig.json')
  },
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      'node': {
        'extensions': [ '.js', '.ts', '.jsx', '.tsx' ]
      }
    }
  },
  rules: {
    'class-methods-use-this': 0,
    'func-names': 0,
    'import/prefer-default-export': 0,
    'import/no-unresolved': 0,
    'lines-between-class-members': 0,
    'no-await-in-loop': 0,
    'no-continue': 0,
    'no-inner-declarations': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'no-restricted-syntax': 0,
    'no-return-assign': 0,
    'no-throw-literal': 0,
    'no-underscore-dangle': 0,
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'never' ],
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0
  }
}
