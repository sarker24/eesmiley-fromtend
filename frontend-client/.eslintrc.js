module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
    'jest/globals': true
  },
  plugins: ['jest', 'wdio', 'prettier'],
  extends: [
    'plugin:wdio/recommended',
    'eslint:recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  rules: {
    'no-prototype-builtins': 'off'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module'
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react/recommended',
        'prettier',
        'prettier/@typescript-eslint',
        'prettier/react',
        'plugin:prettier/recommended' // Needs to be last entry
      ],
      plugins: ['@typescript-eslint', 'react', 'prettier'],
      settings: {
        react: {
          version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
        }
      },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off', //  throws warnings from react lifecycle methods
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { vars: 'all', args: 'after-used', ignoreRestSiblings: true }
        ],
        'no-explicit-any': 'off',
        '@typescript-eslint/no-explicit-any': 'off' // requires lots of work to fix, todo later on
      }
    }
  ]
};
