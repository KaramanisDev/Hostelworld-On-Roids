import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  js.configs.recommended,
  ...compat.extends(
    'standard',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: {
      unicorn
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      },
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      'import/resolver': {
        node: {
          paths: [path.join(__dirname, 'src/app')],
          extensions: ['.ts', '.tsx', '.js', '.mjs']
        }
      }
    },
    rules: {
      'max-len': ['error', { code: 120 }],
      'no-void': 'off',
      'import/no-named-default': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'unicorn/filename-case': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-nested-ternary': 0,
      'unicorn/explicit-length-check': 0,
      'unicorn/prefer-add-event-listener': 0,
      'unicorn/name-replacements': ['error', {
        replacements: {
          application: false,
          applications: false,
          args: false,
          configuration: false,
          repository: false,
          utils: false
        }
      }],
      'import/no-useless-path-segments': ['error', {
        noUselessIndex: true
      }],
      'import/no-cycle': ['error', {
        maxDepth: Infinity,
        ignoreExternal: true
      }]
    }
  }
]
