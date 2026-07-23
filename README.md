# 检测报告管理系统前端

基于 `Vue 3 + TypeScript + Vite + Element Plus` 的后台管理前端项目，面向检测报告、巡检任务、权限菜单和认证流程等业务场景。

当前项目已经完成这些基础能力：

- 后台布局框架：左侧菜单、顶部栏、面包屑、内容区
- 路由权限控制：菜单显示与页面访问统一按权限码处理
- 认证基础能力：账密登录、短信验证码登录、图形验证码、双 token 刷新
- HTTP 请求封装：统一业务码处理、重复请求取消、全局 loading、进度条、下载上传
- 指令与 Hook 扩展：权限指令、布局菜单权限 Hook

## 技术栈

- `Vue 3.5` + `script setup`
- `TypeScript 6`
- `Vite 8`
- `Vue Router 5`
- `Pinia` + `pinia-plugin-persistedstate`
- `Element Plus`
- `Axios`
- `Sass / SCSS`
- `VueUse`
- `NProgress`
- `unplugin-auto-import`
- `unplugin-vue-components`
- `vite-plugin-svg-icons`

## 运行要求

- `Node.js`: `^20.19.0 || >=22.12.0`
- 包管理器：`pnpm`

## 快速开始

```bash
pnpm install
pnpm dev
```

常用命令：

- `pnpm dev`: 开发环境启动
- `pnpm test`: 以 `test` 模式启动 Vite
- `pnpm prod`: 以 `production` 模式启动 Vite
- `pnpm build`: 类型检查并构建
- `pnpm preview`: 预览构建产物
- `pnpm type-check`: 执行 `vue-tsc --build`
- `pnpm lint`: 执行 `oxlint` 和 `eslint`
- `pnpm format`: 使用 `prettier` 格式化代码

## 环境变量

当前项目已使用到的环境变量：

- `VITE_APP_TITLE`: 页面标题
- `VITE_API_BASE_URL`: 后端接口根地址

示例：

```env
VITE_APP_TITLE=Inspection Report Manage Web
VITE_API_BASE_URL=http://127.0.0.1:8081/api
```

## 目录结构

```text
.
├── public
├── src
│   ├── assets
│   │   ├── icons
│   │   └── images
│   ├── components
│   │   └── SvgIcon
│   ├── constants
│   ├── directives
│   ├── hooks
│   │   └── useLayoutMenus
│   ├── http
│   │   ├── auth
│   │   ├── index.ts
│   │   └── index.d.ts
│   ├── layouts
│   ├── router
│   │   ├── modules
│   │   └── permission.ts
│   ├── stores
│   │   └── modules
│   ├── styles
│   │   ├── abstracts
│   │   ├── base
│   │   └── components
│   ├── views
│   │   ├── Dashboard
│   │   ├── Error
│   │   ├── Login
│   │   └── RouteDemo
│   ├── App.vue
│   └── main.ts
├── env.d.ts
├── eslint.config.ts
├── tsconfig.app.json
└── vite.config.ts
```

## 分层说明

### `src/http`

负责所有接口请求封装。

- `src/http/index.ts`
  - 统一 Axios 实例
  - 统一请求/响应拦截
  - 业务码处理
  - token 自动携带
  - token 刷新重试
  - 重复请求取消
  - 文件上传下载
- `src/http/index.d.ts`
  - 公共请求/响应类型
- `src/http/auth`
  - 认证相关接口和实体定义

建议：每个业务域都按 `目录 + index.ts + index.d.ts` 的形式拆分。

### `src/router`

负责路由定义、权限控制和导航守卫。

- `src/router/modules/index.ts`
  - 维护静态模块路由
  - 路由 `meta` 中使用 `permission` 存放权限码
- `src/router/permission.ts`
  - 提供路由权限判断、公用路径拼接、首个可访问路由查找等公共能力
- `src/router/index.ts`
  - 页面标题
  - NProgress
  - 未登录逻辑占位
  - 无权限自动跳转

### `src/stores`

当前以 `auth` 模块为核心：

- token 管理
- refresh token 刷新流程
- 权限码集合管理
- 权限判断方法：`hasPermission`、`hasAnyPermission`、`hasAllPermissions`

### `src/directives`

当前已实现 `v-permission` 权限指令，支持：

- 单个权限码
- 多个权限码
- `and / or` 模式

### `src/hooks`

放可复用的组合式逻辑。

当前已有：

- `useLayoutMenus`
  - 根据路由配置和权限码生成左侧菜单树

### `src/layouts`

放系统级布局。

当前 `LayoutDefault.vue` 是后台主框架布局，包含：

- 左侧菜单
- 顶部栏
- 面包屑
- 主内容区

### `src/views`

页面按业务模块目录组织，目录名使用 `PascalCase`，页面入口统一为 `index.vue`。

## 代码风格与命名规范

项目当前风格比较明确，建议后续保持一致。

### 通用格式

- 缩进：`2` 空格
- 引号：`单引号`
- 结尾：`不加分号`
- 最大行宽：`100`
- 尽量使用 `trailingComma: all`

### Vue 规范

- 统一使用 `script setup`
- 统一使用 Composition API
- SFC 块顺序固定：`template -> script -> style`
- 组件模板中优先使用 `PascalCase`

### 命名规范

- 组件目录：`PascalCase`
  - 例如 `src/components/SvgIcon`
- 页面目录：`PascalCase`
  - 例如 `src/views/Login`
- 页面和组件入口文件：统一 `index.vue`
- Hook：`useXxx`
  - 例如 `useLayoutMenus`
- Store：按业务域拆分
  - 例如 `stores/modules/auth.ts`
- 常量：`UPPER_SNAKE_CASE`
  - 例如 `LOGIN_URL`
- 接口方法：语义动词 + `API`
  - 例如 `getCaptchaAPI`
- 类型名：使用名词性 `PascalCase`
  - 例如 `LoginResponse`

### 导入规范

- `src` 下跨目录导入统一使用 `@` 别名
- 避免使用跨层级 `../` 引入业务模块
- 同一模块的值导入与类型导入尽量合并
  - 例如 `import http, { type ExecuteResult } from '@/http'`

### 注释规范

项目当前倾向“必要但不冗余”的中文注释：

- 常量、核心方法、复杂流程加注释
- HTTP、权限、路由守卫等关键逻辑优先说明“为什么这样做”
- 接口方法使用 JSDoc
  - `@param`
  - `@returns`

## Lint 与约束

当前工程已经显式启用并依赖这些规则：

- `no-duplicate-imports`
- `no-param-reassign`
- `no-restricted-imports`
  - 禁止在 `src` 内滥用 `../*`
- `prefer-const`
- `eqeqeq`
- `curly`
- `vue/component-api-style`
- `vue/block-order`
- `vue/no-mutating-props`
- `vue/require-explicit-emits`

这意味着开发时要特别注意：

- 不要直接修改函数参数对象属性
- 不要随手加 `console.log`
- 不要把跨目录导入写成大量相对路径
- 组件和页面尽量按既有结构落位，不要随意平铺

## UI 与样式约定

### 样式体系

- 全局入口：`src/styles/main.scss`
- 抽象变量：`src/styles/abstracts`
- 通过 Vite 自动注入：

```scss
@use "@/styles/abstracts" as *;
```

这意味着所有 `scss` 文件里可以直接使用变量和 mixin，无需重复手动导入。

### 当前设计变量

项目已定义一套基础视觉 token：

- 颜色：`$color-text`、`$color-background`、`$color-surface`、`$color-primary`
- 圆角：`$radius-sm`、`$radius-md`
- 间距：`$space-xs ~ $space-xl`
- 阴影：`$shadow-sm`

建议新增页面优先复用这些 token，不要自行散落新的硬编码颜色和尺寸。

## 权限模型

当前项目已经形成了比较清晰的权限使用方式。

### 菜单权限

路由 `meta.permission` 作为菜单和页面权限码来源，支持：

- `string`
- `string[]`

示例：

```ts
meta: {
  title: '用户管理',
  permission: 'system:user:query',
}
```

或：

```ts
meta: {
  title: '报告审核',
  permission: ['report:review:query', 'report:review:approve'],
}
```

### 页面访问权限

`router.beforeEach` 会校验目标路由是否可访问：

- 有权限：正常进入
- 无权限：优先跳转同模块下第一个可访问页面
- 无可访问页面：跳转 `403`

### 指令权限

可以在模板中使用：

```vue
<el-button v-permission="'system:user:query'">查看</el-button>
<el-button v-permission:and="['report:review:query', 'report:review:approve']">
  审核
</el-button>
```

## 认证流程

当前认证相关页面和接口已具备基本联调能力：

- 图形验证码获取
- 账密登录
- 短信验证码发送
- 短信验证码登录
- refresh token 刷新
- 退出登录

登录页位于 `src/views/Login/index.vue`，登录成功后会：

- 写入 `accessToken`
- 写入 `refreshToken`
- 根据接口返回的 `authorities` 更新权限码
- 跳转回 `redirect` 或首页

## HTTP 封装约定

后续新增接口时，建议遵循当前 `http` 层约定：

### 新增模块方式

1. 在 `src/http/<module>/index.d.ts` 中定义请求/响应实体
2. 在 `src/http/<module>/index.ts` 中实现 API 方法
3. 方法名统一使用 `API` 后缀
4. 注释统一使用 JSDoc 风格

示例：

```ts
/**
 * 获取详情
 * @param id 主键
 * @returns 详情数据
 */
export const getDetailAPI = (id: string): Promise<DetailResponse> => {
  return http.get<DetailResponse>(`module/detail/${id}`);
};
```

### 当前 `http` 层能力

- 自动拼接时间戳避免 GET 缓存
- 自动 trim 字符串字段
- 自动注入 token
- 业务码统一处理
- 401/认证失效自动刷新 token 并重试
- 统一错误提示
- 上传下载封装
- 请求进度条
- 可选全屏 loading

## 路由扩展建议

新增后台菜单时，建议直接在 `src/router/modules/index.ts` 中补充模块路由，并补齐：

- `meta.title`
- `meta.icon`
- `meta.permission`
- `meta.description`

因为当前布局、菜单生成、页面标题和权限判断都依赖这些字段。

## 开发建议

### 新增页面

1. 在 `src/views/<ModuleName>/index.vue` 创建页面
2. 在 `src/router/modules/index.ts` 补路由
3. 配置 `meta.permission`
4. 如有按钮权限，优先使用 `v-permission`

### 新增接口

1. 在 `src/http/<domain>` 下补 `index.d.ts`
2. 再补 `index.ts`
3. 优先复用 `src/http/index.ts` 的封装能力

### 新增全局能力

- 组合逻辑放 `hooks`
- 指令放 `directives`
- 全局常量放 `constants`
- 公共类型放 `src/http/index.d.ts` 或 `src/types`

## 当前状态说明

当前仓库已经具备后台项目骨架，但仍属于“可联调、可扩展”的基础阶段，主要体现在：

- 菜单和部分业务页仍是测试数据 / 占位页
- 未登录跳登录逻辑在路由守卫中被临时放开，并带有 `TODO`
- 后续实际接入时，需要用真实后端权限码替换测试权限数据

## 推荐协作方式

如果后续多人维护，建议把提交内容按下面方式拆分：

- `feat(auth)`: 认证与登录流程
- `feat(router)`: 路由、菜单、权限
- `feat(http)`: 请求封装、接口模块
- `feat(view)`: 业务页面
- `style(layout)`: 布局和视觉层调整
- `refactor`: 不改行为的结构整理

这样更贴合当前项目的分层结构，也更方便排查问题。
