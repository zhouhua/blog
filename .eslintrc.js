module.exports = {
  extends: [
    'airbnb',
    'airbnb-typescript/base',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true
    }
  },
  parserOptions: { project: './tsconfig.json' },
  globals: { graphql: true },
  env: {
    browser: true,
    node: true
  },
  ignorePatterns: ['public/**/*'],
  rules: {
    'no-restricted-exports': 0,
    'no-confusing-arrow': 0,
    'func-names': 0,
    'no-nested-ternary': 0,
    'object-curly-newline': ['error', { consistent: true }],
    'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: true }],
    'no-console': 'off',
    'no-debugger': 2,
    'comma-dangle': ['error', 'never'],
    '@typescript-eslint/comma-dangle': ['error', 'never'],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'global-require': 0,
    'import/order': 2,
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true
      }
    ],
    'no-lonely-if': 2,
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false
      }
    ],
    'no-constant-condition': ['error', { checkLoops: false }],
    'quote-props': ['error', 'consistent-as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'function-paren-newline': [1, 'consistent'],
    'curly': ['error', 'all'],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxBOF: 1,
        maxEOF: 1
      }
    ],
    'id-length': [
      'error',
      {
        min: 1,
        max: 32,
        exceptions: ['i', 'j', 'k', 'u', '_', '$', 't', 'r', 'l', 'x', 'y']
      }
    ],
    'no-plusplus': 0,
    'no-restricted-syntax': [2, 'LabeledStatement', 'WithStatement'],
    'array-element-newline': ['warn', { ArrayExpression: 'consistent' }],
    'consistent-return': 0,
    'class-methods-use-this': 0,
    'react/jsx-uses-vars': 2,
    'import/no-dynamic-require': 0,
    'react/jsx-indent': ['error', 2],
    'react/no-danger': 0,
    'react/jsx-indent-props': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'react/function-component-definition': 0,
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports'
      }
    ],
    'no-param-reassign': ['error', { props: false }],
    'import/prefer-default-export': 0,
    'react/jsx-no-bind': 0,
    'react/jsx-props-no-spreading': 0,
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: true,
          object: true
        },
        AssignmentExpression: {
          array: false,
          object: false
        }
      },
      { enforceForRenamedProperties: false }
    ],
    'react/require-default-props': 0,
    'react/prop-types': 0,
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off'
  }
};
