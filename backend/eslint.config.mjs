
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },

  // Browser globals
  { languageOptions: { globals: globals.browser } },

  // Node/PM2 config
  {
    files: ['ecosystem.config.js', 'ecosystem.config.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    ignores: ['node_modules', 'dist'],
    rules: {
      'no-unused-vars': 'error',
      'no-unused-expressions': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
];