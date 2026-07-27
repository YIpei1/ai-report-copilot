# AI Report Copilot

AI Report Copilot 是一个基于 Vue 3、TypeScript 和 Vite 构建的 AI 报告辅助项目。

项目当前处于工程化建设阶段，优先完成开发环境、代码规范、Git 工作流和 CI 质量门禁，再进入正式业务开发。

## 当前阶段

### 已完成

- Vue 3、TypeScript、Vite 基础环境
- Vue Router 路由配置
- Pinia 状态管理
- Element Plus 组件库和自动导入
- Axios 请求依赖
- Sass / SCSS 样式体系
- `@`路径别名
- ESLint、Prettier、Stylelint、TypeScript 质量检查
- Husky、lint-staged、commitlint 本地 Git 检查
- GitHub Actions CI
- main 分支 PR 和 Quality Gate 保护
- main、dev 分支协作流程

### 待完成

- dev 分支保护
- 工程化配置最终验证
- 正式业务页面与功能开发
- 单元测试和端到端测试
- Docker、部署和 CD

## 技术栈

### 业务依赖

- `Vue 3.5`：前端框架
- `TypeScript 6`：类型系统
- `Vite 8`：开发和构建工具
- `Vue Router 5`：路由管理
- `Pinia 4`：状态管理
- `Element Plus`：UI 组件库
- `Axios`：HTTP 请求工具
- `Sass / SCSS`：CSS 预处理器

### 工程依赖

- `unplugin-auto-import`：API 自动导入
- `unplugin-vue-components`：组件自动导入
- `ESLint`：JavaScript、TypeScript、Vue 代码检查
- `Prettier`：代码格式统一
- `Stylelint`：CSS、SCSS、Vue 样式检查
- `vue-tsc`：Vue 和 TypeScript 类型检查
- `Husky`：Git Hook 管理
- `lint-staged`：Git 暂存文件检查
- `commitlint`：Git 提交信息检查

## 运行要求

- `Node.js`：`>=22.14.0 <23`
- `pnpm`：`>=10.6.5 <11`

项目根目录的`.nvmrc`声明推荐使用 Node.js 22。

查看当前版本：

```bash
node -v
pnpm -v
```

## 快速开始

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

生产构建：

```bash
pnpm build
```

预览生产构建：

```bash
pnpm preview
```

## 环境变量

项目使用 Vite 环境变量，当前变量为：

```env
VITE_API_BASE_URL=
```

环境文件分工：

| 文件               | 用途                   |
| ------------------ | ---------------------- |
| `.env`             | 所有模式共用的默认配置 |
| `.env.development` | 开发环境配置           |
| `.env.test`        | 测试环境配置           |
| `.env.production`  | 生产环境配置           |

代码中通过下面的方式读取：

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

注意：

- 只有以`VITE_`开头的变量才能在前端代码中读取。
- `VITE_`变量会进入浏览器代码，不能保存密码、私钥或真正的 API 密钥。
- 修改环境变量后，需要重新启动开发服务器。

## 项目命令

| 命令                  | 作用                                     |
| --------------------- | ---------------------------------------- |
| `pnpm dev`            | 启动 Vite 开发服务器                     |
| `pnpm build`          | 执行类型检查并构建生产代码               |
| `pnpm preview`        | 预览生产构建结果                         |
| `pnpm format`         | 使用 Prettier 格式化项目                 |
| `pnpm format:check`   | 检查项目格式                             |
| `pnpm lint`           | 执行 ESLint 检查                         |
| `pnpm lint:fix`       | 自动修复可修复的 ESLint 问题             |
| `pnpm lint:style`     | 执行 Stylelint 检查                      |
| `pnpm lint:style:fix` | 自动修复可修复的样式问题                 |
| `pnpm verify`         | 依次执行格式、代码、样式、类型和构建检查 |

完整质量检查：

```bash
pnpm verify
```

执行顺序：

```text
Prettier
  → ESLint
  → Stylelint
  → vue-tsc
  → Vite Build
```

## 代码规范

### ESLint

ESLint 检查 JavaScript、TypeScript 和 Vue 文件，并使用：

- JavaScript 官方推荐规则
- TypeScript 推荐规则
- Vue 3 推荐规则
- 浏览器和 Node.js 运行环境配置
- eslint-config-prettier 冲突规则关闭配置

### Prettier

主要格式规则：

- 不使用分号
- 使用单引号
- 使用四个空格缩进
- 单行最大 100 个字符
- 使用 LF 换行符

### Stylelint

Stylelint 检查：

- CSS
- SCSS
- Vue 文件中的`<style>`

### EditorConfig 和 GitAttributes

- `.editorconfig`统一编辑器的编码、缩进和换行行为。
- `.gitattributes`统一 Git 中文本文件的 LF 换行符，并标记二进制文件。

## Git 提交流程

### 本地检查

执行`git commit`时：

```text
pre-commit
  → lint-staged
  → ESLint / Stylelint / Prettier

commit-msg
  → commitlint
```

lint-staged 只检查本次进入 Git 暂存区的文件。

### 提交信息

项目使用 Conventional Commits 约定式提交规范：

```text
feat: 添加新功能
fix: 修复问题
docs: 更新文档
style: 调整代码格式
refactor: 重构代码
test: 添加测试
chore: 调整工程配置
ci: 修改 CI 配置
```

## 分支工作流

分支职责：

- `main`：稳定、可发布的主分支
- `dev`：日常开发集成分支
- `feature/*`：功能开发分支
- `fix/*`：普通问题修复分支
- `hotfix/*`：生产环境紧急修复分支

功能开发流程：

```text
dev
  → 创建 feature/功能名_日期
  → 开发并提交
  → 创建 feature/功能名_日期 → dev 的 PR
  → CI 检查通过后合并到 dev
  → dev 稳定后创建 dev → main 的 PR
  → CI 检查通过后合并到 main
```

创建功能分支：

```bash
git switch dev
git pull origin dev
git switch -c feature/example_date
git push -u origin feature/example_date
```

## CI 质量门禁

GitHub Actions 在以下事件中运行：

- 向`main`或`dev`发起 Pull Request
- 推送到`main`或`dev`

`Quality Gate`包含：

1. 检出仓库代码
2. 配置 pnpm 和 Node.js
3. 使用锁文件安装依赖
4. PR 中检查提交信息
5. 检查 Prettier
6. 运行 ESLint
7. 运行 Stylelint
8. 执行 TypeScript 类型检查
9. 执行 Vite 生产构建

任何必需检查失败，PR 都不能通过质量门禁。

## 目录结构

```text
.
├── .github
│   └── workflows
│       └── ci.yml
├── .husky
│   ├── commit-msg
│   └── pre-commit
├── public
├── src
│   ├── api
│   │   ├── login
│   │   └── user
│   ├── assets
│   ├── constants
│   ├── layouts
│   ├── router
│   ├── stores
│   ├── styles
│   │   ├── common.scss
│   │   ├── index.scss
│   │   ├── reset.scss
│   │   ├── themes.scss
│   │   └── variables.scss
│   ├── types
│   ├── utils
│   ├── views
│   │   └── home.vue
│   ├── App.vue
│   └── main.ts
├── .editorconfig
├── .env
├── .env.development
├── .env.production
├── .env.test
├── .gitattributes
├── .nvmrc
├── .prettierrc.json
├── commitlint.config.js
├── eslint.config.js
├── package.json
├── stylelint.config.js
├── tsconfig.app.json
└── vite.config.ts
```

## 工程质量闭环

```text
编辑器基础配置
  → 本地格式和代码检查
  → Git Hook 提交检查
  → Pull Request
  → GitHub Actions CI
  → Quality Gate
  → 分支保护
  → 合并代码
```

工程化配置完成后，业务功能统一从`dev`创建`feature/*`分支进行开发。
