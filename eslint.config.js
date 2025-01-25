import js from '@eslint/js';
import globals from 'globals';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint'
import tseslintparser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  ...eslintPluginAstro.configs['flat/recommended'],
  ...eslintPluginAstro.configs['flat/jsx-a11y-recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        dataLayer: false,
      },
      parser: tseslintparser,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { "fixStyle": "inline-type-imports" }],
    }
  },
];