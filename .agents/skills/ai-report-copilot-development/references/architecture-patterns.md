# 项目架构与开发模板

## 项目文件结构

```text
src/
├─ api/                 接口函数和业务类型
├─ assets/              图片、图标和其他静态资源
├─ components/          可复用 Vue 组件
├─ constants/           全局常量
├─ http/                Axios 实例、拦截器和公共响应类型
├─ layouts/             公共页面布局
├─ mocks/               MSW 启动配置、处理器和模拟数据
├─ router/              路由和导航守卫
├─ stores/              Pinia 实例和业务 Store
├─ styles/              全局 SCSS 样式基础
├─ types/               全局类型与第三方类型扩展
├─ utils/               与框架无关的工具函数
└─ views/               路由页面
```

## API 业务域模板

每个业务域使用一个独立目录：

```text
src/api/report/
├─ index.ts             接口函数
└─ types.ts             请求和响应类型
```

在 `types.ts` 中定义请求参数和响应数据：

```ts
export interface ReportListParams {
    page: number
    pageSize: number
}

export interface ReportListData {
    total: number
    items: ReportSummary[]
}
```

在 `index.ts` 中定义接口：

```ts
import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type { ReportListData, ReportListParams } from './types'

export const getReportList = (params: ReportListParams) => {
    return request<ApiResponse<ReportListData>, ReportListParams>({
        url: '/reports',
        method: 'get',
        params,
    })
}

export * from './types'
```

## Pinia 业务域模板

跨页面共享的业务状态使用组合式 Store：

```ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useReportStore = defineStore('report', () => {
    const reports = ref<ReportSummary[]>([])

    const hasReports = computed(() => reports.value.length > 0)

    function setReports(items: ReportSummary[]) {
        reports.value = items
    }

    function reset() {
        reports.value = []
    }

    return {
        reports,
        hasReports,
        setReports,
        reset,
    }
})
```

状态不需要在刷新后保留时，不配置持久化。需要持久化时使用 `pick`，只保存必要且可以序列化的状态。

## 登录认证流程

```text
登录页面
  → 调用登录接口
  → 认证 Store 保存令牌
  → 调用用户信息接口
  → 用户 Store 保存资料
  → 路由跳转到受保护页面
```

请求层负责携带认证信息、处理通用 HTTP 错误和协调令牌刷新。页面只保留当前页面特有的加载状态和恢复行为。

## MSW 业务域模板

模拟接口结构应与真实接口保持一致：

```text
src/mocks/
├─ report.ts            报告接口处理器
├─ data/reports.ts      报告模拟数据
└─ handlers/index.ts    处理器统一注册入口
```

新增业务处理器后统一注册：

```ts
import { reportHandlers } from '../report'

export const handlers = [...existingHandlers, ...reportHandlers]
```

## 受保护路由模板

- 使用路由元信息标记需要登录的路由。
- 在导航守卫中读取认证状态。
- 未登录用户跳转到 `/login`。
- 需要登录后返回原页面时，保留用户原本准备访问的地址。
- 页面组件继续使用懒加载。

## 配置来源

- 依赖版本和项目命令：`package.json`
- TypeScript 行为：`tsconfig.app.json`
- Vite 插件和路径别名：`vite.config.ts`
- JavaScript、TypeScript 和 Vue 规则：`eslint.config.js`
- SCSS 和 Vue 样式规则：`stylelint.config.js`
- 格式规则：`.prettierrc.json`
- CI 质量门禁：`.github/workflows/ci.yml`
