import globals from 'globals';

// Plugin and config imports
import eslint from '@eslint/js';
import { plugin as tsPlugin } from 'typescript-eslint';

// Parser imports
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';

// Plugin imports
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import no_loops from 'eslint-plugin-no-loops';
import piniaPlugin from 'eslint-plugin-pinia';

// Config imports
import eslintPluginImportX, { flatConfigs as importFlatConfig } from 'eslint-plugin-import-x';
import comments_config from '@eslint-community/eslint-plugin-eslint-comments/configs';
import playwright from 'eslint-plugin-playwright';
import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import vueSkipFormattingConfig from '@vue/eslint-config-prettier/skip-formatting';
import vitest from '@vitest/eslint-plugin';

export default defineConfigWithVueTs([
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: vueParser
    },
    plugins: {
      import: eslintPluginImportX,
      tsPlugin: tsPlugin,
      'no-loops': no_loops,
      piniaPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'import/order': 2,
      'no-loops/no-loops': 2
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
          bun: true, // resolve Bun modules https://github.com/import-js/eslint-import-resolver-typescript#bun
          project: 'tsconfig.app.json'
        })
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ]
        }
      ]
    }
  },
  eslint.configs.recommended,
  comments_config.recommended,
  vueTsConfigs.recommended,
  ...pluginVue.configs['flat/recommended'],
  importFlatConfig.recommended,
  importFlatConfig.typescript,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ignores: ['eslint.config.js'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'off',
      'import-x/no-dynamic-require': 'warn',
      'import-x/no-nodejs-modules': 'warn'
    }
  },
  piniaPlugin.configs['all-flat'],
  {
    files: ['**/__tests__/**'],
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      'vitest/max-nested-describe': ['error', { max: 3 }] // you can also modify rules' behavior using option like this
    }
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.{js,ts,jsx,tsx}'],
    rules: {
      ...playwright.configs['flat/recommended']
    }
  },
  vueSkipFormattingConfig
]);
