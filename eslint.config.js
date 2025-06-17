import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier';

const compat = new FlatCompat();

const config = [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      // '@typescript-eslint/no-var-requires': 'error', // Commented out problematic rule
    },
  },
];

export default config;
