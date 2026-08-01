---
name: ai-report-copilot-development
description: 开发、审查、重构和讲解 AI 报告助手 Vue 3 与 TypeScript 项目。处理本项目的 Vue 页面、API 模块、Axios 请求层、Pinia 状态、Vue Router 路由、MSW 模拟接口、Element Plus 界面、SCSS 样式、工程配置或质量门禁时使用此技能。
---

# AI 报告助手项目开发

## 文件结构

```text
.agents/skills/ai-report-copilot-development/
├─ SKILL.md                              技能触发条件和执行流程
├─ agents/
│  └─ openai.yaml                       技能名称、简介和默认提示词
└─ references/
   └─ architecture-patterns.md           项目架构和开发模板
```

## 执行流程

1. 阅读仓库根目录的 `AGENTS.md`。
2. 检查 `git status`，保留用户已有修改。
3. 修改代码前，阅读目标文件和相邻业务文件。
4. 判断任务所属层级：页面、组件、接口、请求层、Store、路由、模拟接口或工程配置。
5. 复用项目已有模式，不创建职责重复的抽象。
6. 完成范围最小但功能完整的修改。
7. 先执行针对性验证，跨层修改再执行完整验证。
8. 总结修改文件、行为变化和验证结果。

## 按层级安排代码

- 请求和响应类型放在 `src/api/<业务域>/types.ts`。
- 接口函数放在 `src/api/<业务域>/index.ts`。
- 可复用请求行为放在 `src/http/`，不放在页面中。
- 跨页面业务状态放在 `src/stores/modules/`。
- 表单和页面展示状态保留在 Vue 组件中。
- 路由访问控制放在 `src/router/`。
- 开发环境接口模拟放在 `src/mocks/`。
- 公共视觉规则放在 `src/styles/`，其他样式优先使用组件作用域样式。

## 保持项目约定

- 使用 `ApiResponse<T>` 表示公共接口响应结构。
- API 模块使用项目请求函数，不直接调用 Axios 实例。
- 读取未知错误属性前必须完成类型收窄。
- 通用错误提示由拦截器处理，调用方只处理自定义恢复行为。
- Pinia 使用组合式 Store、明确的重置方法和持久化白名单。
- 模拟接口数据与正式 API 类型保持同步。
- `src/` 内部导入使用 `@/` 路径别名。

## 教学模式

- 用户询问“为什么”或“怎么做”时，先解释概念，再给出代码。
- 关键技术名词第一次出现时附带简短中文注释。
- 涉及 TypeScript 时，区分编译阶段与 JavaScript 运行阶段。
- 用户要求一步一步操作时，每次只提供一个明确步骤。
- 用户只要求操作说明时，不修改项目文件。

## 验证选择

- TypeScript、Vue 或 JavaScript：运行 `pnpm lint`。
- SCSS、CSS 或 Vue 样式：运行 `pnpm lint:style`。
- 格式相关修改：运行 `pnpm format:check`。
- 类型、导入、工程配置或构建行为：运行 `pnpm build`。
- 跨多个层级的修改：运行 `pnpm verify`。

## 参考资料

新增业务域、接口流程、Store、模拟处理器或登录鉴权路由时，阅读
[项目架构与开发模板](references/architecture-patterns.md)。
