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
  {
    ignores: ['**/*.config.js']
  },
  js.configs.recommended,
  ...compat.extends(
    'standard',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    files: ['**/*.{ts,js,mjs}'],
    plugins: {
      unicorn
    },
    languageOptions: {
      globals: {
        ...globals.node
      },
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module'
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
      'unicorn/prevent-abbreviations': ['error', {
        replacements: {
          args: false,
          utils: false
        }
      }],
      'import/no-useless-path-segments': ['error', {
        noUselessIndex: true
      }]
    }
  }
]
