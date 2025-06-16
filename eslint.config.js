import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier';

const compat = new FlatCompat();

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
