// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', '**/*.d.ts', 'dist', 'node_modules'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      prettier: eslintPluginPrettier,
    },

  },
  
  {
    rules: {
      
      // 'prettier/prettier': [
      //   'error',
      //   {
      //     singleQuote: true,
      //     trailingComma: 'all',
      //     printWidth: 100,
      //     tabWidth: 2,
      //     semi: true,
      //     arrowParens: 'always',
      //     endOfLine: 'auto',
      //     // Pastikan tidak ada endWithNewline di sini
      //   },
      //   {
      //     usePrettierrc: false // Memaksa menggunakan konfigurasi di sini
      //   }
      // ],
      
      // Aturan tambahan untuk menghindari konflik
      'max-len': ['error', { code: 100, ignoreUrls: true }],
      'operator-linebreak': ['error', 'after'],
      'function-paren-newline': ['error', 'consistent'],
      
      '@typescript-eslint/no-unsafe-call': 'off',
      
      // Aturan TypeScript Anda
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);
