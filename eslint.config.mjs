import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import importPlugin from 'eslint-plugin-import'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname
})

export default [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        plugins: {
            import: importPlugin
        },
        rules: {
            'prefer-const': 'off',
            '@typescript-eslint/prefer-const': 'off',
            'no-const-assign': 'error',
            'prefer-arrow-callback': 'off',
            'func-style': [
                'warn',
                'declaration',
                {
                    allowArrowFunctions: false
                }
            ],
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true
                    },
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before'
                        },
                        {
                            pattern: 'ui',
                            group: 'internal'
                        },
                        {
                            pattern: 'utilities',
                            group: 'internal'
                        }
                    ],
                    pathGroupsExcludedImportTypes: ['builtin']
                }
            ]
        }
    },
    {
        files: [
            '**/hooks/**/*.{js,jsx,ts,tsx}',
            '**/*.store.{js,ts}',
            '**/*memo*.{js,jsx,ts,tsx}',
            '**/callbacks/**/*.{js,jsx,ts,tsx}'
        ],
        rules: {
            'func-style': 'off'
        }
    }
]
