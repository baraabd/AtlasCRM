import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/android/**',
      '**/ios/**',

      // ignore other eslint configs
      '**/apps/**/eslint.config.*',

      // Prisma generated (do not lint)
      '**/apps/crm-api/generated/**',
      '**/apps/crm-api/prisma/**/.prisma/**',

      // Do not auto-fix tests in API (prevents "no tests" accidents)
      '**/apps/crm-api/**/*.spec.ts',
      '**/apps/crm-api/**/*.e2e-spec.ts',
    ],
  },

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-native/no-inline-styles': 'warn',
    },
  },

  // NestJS API override — prevent breaking DI with type-only imports
  {
    files: ['apps/crm-api/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
