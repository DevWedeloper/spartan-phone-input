import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

const compat = new FlatCompat({ js });

export default defineConfig([
  compat.extends('plugin:@angular-eslint/recommended'),
  compat.extends('plugin:@angular-eslint/template/process-inline-templates'),
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          style: 'kebab-case',
        },
      ],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      semi: ['error', 'always'],
    },
  },
]);
