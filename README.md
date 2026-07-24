## 技术栈

- `Vue 3.5` + `script setup`
- `TypeScript 6`
- `Vite 8`
- `Vue Router 5`
- `Pinia` + `pinia-plugin-persistedstate`
- `Element Plus`
- `Axios`
- `Sass / SCSS`
- `unplugin-auto-import`
- `unplugin-vue-components`
- `eslint`

## 运行要求

- `Node.js`: `^20.19.0 || >=22.12.0`
- 包管理器：`pnpm`

## 快速开始

```bash
pnpm install
pnpm dev
```

## 目录结构

```text
.
├── public
├── src
│   ├── styles
│   │   └──  index.scss 样式入口文件
│   │   └──  common.scss 公共class
│   │   └──  reset.scss 浏览器基础样式
│   │   └──  themes.scss 主题颜色  css变量 可变化视觉属性
│   │   └──  variables.scss scss开发变量/固定设计规则
│   ├── assets
│   │   ├── icons
│   │   └── images
│   ├── components
│   ├── constants
│   │   └── index 项目常量
│   ├── directives
│   ├── hooks
│   ├── api
│   │   ├── login
│   │   │  ├── index.ts
│   │   │  ├── index.d.ts ts类型扩展
│   ├── layouts
│   ├── views
│   │   ├── home
│   │   ├── Error
│   │   ├── Login
│   ├── App.vue
│   └── main.ts
├── env.d.ts
├── eslint.config.ts
├── tsconfig.app.json
└── vite.config.ts
```
