import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default [
  // 1. 忽略不需要检查的文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'auto-imports.d.ts',
      'components.d.ts',
    ],
  },

  // 2. JavaScript 官方推荐规则
  js.configs.recommended,

  // 3. TypeScript 官方推荐规则
  ...tseslint.configs.recommended,

  // 4. Vue 3 官方推荐规则
  ...pluginVue.configs['flat/recommended'],

  // 5. 浏览器代码运行环境
  {
    files: ['src/**/*.{js,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // 6. 让 Vue 文件中的 script 支持 TypeScript
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 7. Node.js 配置文件运行环境
  {
    files: ['*.config.{js,ts}', 'vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // 8. 项目自定义规则
  {
    rules: {
      'no-debugger': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  },

  // 9. 关闭与 Prettier 冲突的格式规则
  eslintConfigPrettier,
]