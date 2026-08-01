# AI 报告助手项目规范

## 适用范围

本文件中的规则适用于整个项目仓库。

## 文件结构

```text
.
├─ .agents/
│  └─ skills/
│     └─ ai-report-copilot-development/
│        ├─ SKILL.md                         项目开发技能说明
│        ├─ agents/openai.yaml              技能展示和调用配置
│        └─ references/architecture-patterns.md
│                                            项目架构与开发模板
├─ .github/workflows/ci.yml                 CI 质量门禁
├─ .husky/                                  Git 本地钩子
├─ public/                                  公共静态资源
├─ src/
│  ├─ api/                                  业务接口与接口类型
│  ├─ assets/                               图片、图标等资源
│  ├─ components/                           公共组件
│  ├─ constants/                            全局常量
│  ├─ http/                                 Axios 请求层
│  ├─ layouts/                              页面布局
│  ├─ mocks/                                MSW 模拟接口
│  ├─ router/                               路由和路由守卫
│  ├─ stores/                               Pinia 状态管理
│  ├─ styles/                               全局 SCSS 样式
│  ├─ types/                                全局类型和类型扩展
│  ├─ utils/                                通用工具函数
│  └─ views/                                路由页面
├─ AGENTS.md                                项目级智能体开发规范
├─ package.json                             依赖、版本和项目命令
└─ vite.config.ts                           Vite 配置
```

## 项目背景

- 项目用于展示具备求职竞争力的前端工程化和业务开发能力。
- 优先完善工程基础，再逐步扩展正式业务功能。
- 技术栈包括 Vue 3、TypeScript、Vite、Vue Router、Pinia、Axios、Element Plus、SCSS 和 MSW。
- 统一使用 `pnpm`，并遵守 `package.json` 中声明的 Node.js 和 pnpm 版本。

## 协作规则

- 保留用户已有修改，不覆盖与当前任务无关的代码。
- 修改前先阅读目标文件及相邻业务文件。
- 修改范围保持最小、完整，并遵循现有代码风格。
- 用户只要求讲解或者明确要求不要修改时，只提供说明，不修改文件。
- 教学时，重要技术名词第一次出现应附带简短中文注释。
- 引入复杂抽象前，先解释作用、数据流和使用原因。

## 架构规则

- 接口函数放在 `src/api/<业务域>/index.ts`。
- 接口请求和响应类型放在 `src/api/<业务域>/types.ts`。
- 其他模块需要使用接口类型时，从业务域的 `index.ts` 统一导出。
- Axios 实例、拦截器和通用错误处理统一放在 `src/http/`。
- `ApiResponse<T>` 等公共响应结构放在 `src/http/requestType.ts`。
- 跨页面共享的业务状态按业务域拆分，放在 `src/stores/modules/`。
- 表单、加载状态、弹窗和页面展示状态优先保留在当前组件中。
- 路由定义和路由守卫放在 `src/router/`，页面组件采用懒加载。
- MSW 处理器按业务域拆分，并在 `src/mocks/handlers/index.ts` 中统一注册。
- `src/` 内部文件统一使用 `@/` 路径别名导入。

## Vue 规则

- 优先使用 `<script setup lang="ts" name="组件名称">`。
- 单文件组件顺序保持为 `template`、`script`、`style`。
- 优先使用组合式 API，并使用语义明确的变量和函数名称。
- 解构 Pinia 的响应式状态或计算属性时使用 `storeToRefs()`。
- Pinia 的操作方法可以直接从 Store 实例调用。
- 新增 UI 依赖前，优先复用 Element Plus 和项目已有公共组件。
- 已由自动导入插件提供的 API 或组件，不重复手动导入；显式导入能提升可读性或类型明确性时除外。

## Pinia 规则

- `src/stores/index.ts` 只负责创建 Pinia 实例和安装全局 Pinia 插件。
- 每个 Store 使用唯一且稳定的业务标识，例如 `auth`、`user`、`app`。
- Store 应包含状态、计算属性、业务操作、重置行为和必要的持久化配置。
- 使用 `pick` 明确选择持久化字段，不持久化加载状态、弹窗、密码、函数和计算属性。
- 登录相关 Store 必须提供退出登录时使用的清理或重置方法。
- 避免 Store 在模块顶层互相引用而产生循环依赖。

## TypeScript 与 Axios 规则

- 不使用 `any`；外部类型声明确实无法避免时，只允许在最小范围内使用。
- 捕获到的错误按照 `unknown` 处理，完成类型收窄后才能读取属性。
- Axios 错误使用 `axios.isAxiosError()` 判断；需要读取响应数据时使用
  `AxiosError<ApiResponse<T>>` 指定数据类型。
- 通用 HTTP 错误和业务错误提示放在请求层；页面的 `catch` 只处理当前页面特有的恢复行为。
- Axios 自定义请求参数统一在 `src/types/axios.d.ts` 中扩展。
- 保持请求函数约定：
  `request<TResponse, TRequest = unknown>(config): Promise<TResponse>`。

## 样式规则

- 使用 SCSS，并优先复用 `src/styles/variables.scss` 中的变量。
- 除明确需要全局生效的样式外，组件样式优先使用 `scoped`。
- 类名遵循项目现有的 BEM 风格。
- 只有覆盖第三方组件内部样式时才使用 `:deep()`。
- 第三方类名违反 Stylelint 规则时，只在必要范围内禁用规则并写明原因。
- 遵守项目 Prettier 配置：四个空格、单引号、无分号、单行最多 100 个字符、LF 换行符。

## 模拟接口规则

- MSW 只能通过现有的环境变量启动流程启用。
- 模拟响应结构必须与正式接口类型保持一致。
- 新处理器放入对应业务模块，并注册到处理器汇总文件中。
- 模拟环境专用逻辑不能进入生产代码路径。

## 质量验证

- 开发过程中先运行与修改内容最相关的检查。
- JavaScript、TypeScript 和 Vue 修改运行 `pnpm lint`。
- CSS、SCSS 和 Vue 样式修改运行 `pnpm lint:style`。
- 格式检查运行 `pnpm format:check`。
- 类型和生产构建检查运行 `pnpm build`。
- 修改跨越多个层级时，交付前运行 `pnpm verify`。
- 不手动修改自动生成的 `auto-imports.d.ts` 和 `components.d.ts`。
- 不处理与当前任务无关的失败，只在交付说明中单独报告。

## Git 工作流

- 功能分支从 `dev` 创建，分支名称使用 `feature/*`。
- 功能分支通过 PR 合并到 `dev`，稳定的 `dev` 再通过 PR 合并到 `main`。
- 提交信息遵循约定式提交，例如 `feat:`、`fix:`、`refactor:`、`test:`、`docs:`、`chore:`、`ci:`。
- Husky、lint-staged、commitlint 和 GitHub Actions 质量门禁共同强制执行项目规范。
