# AriaDash — AI Coding Conventions

## 项目描述
AriaDash 是一个纯前端 PWA，通过 JSON-RPC 控制 aria2 下载管理器。部署在 GitHub Pages，无后端服务。

## 当前状态
- **当前阶段**: Phase 4 完成 ✓
- **已完成**: docs/ 全套文档, AGENTS.md, README.md, LICENSE, .github/ 基建, package.json, tsconfig.json, vite.config.ts, postcss.config.js, index.html (含 iOS meta tags), .gitignore, .editorconfig, public/, src/ (main.tsx, App.tsx, index.css), src/api/types.ts, src/api/aria2.ts, src/hooks/useConfig.ts, src/hooks/useAria2.ts, src/hooks/useSwipe.ts, src/context/Aria2Context.tsx, src/components/ (Layout, Header, Dashboard, DownloadList, DownloadItem, BatchActionBar, ProgressBar, StatusBadge, TaskActions, ServerConfig, AddUrlForm, AddDownloadSheet), src/pages/ (Home, Settings, TaskDetail), scripts/generate-icons.mjs, PWA 图标 (icon-192, icon-512, apple-icon-180), .github/workflows/ (deploy.yml, ci.yml, stale.yml)
- **待办**: 初始化 Git 仓库 → GitHub 创建仓库 → 推送 → GitHub Actions 自动部署

## 技术栈
- React 18 + TypeScript 5 (strict mode)
- Vite 6 (构建工具)
- Tailwind CSS v4 (样式)
- React Router v7 (路由)
- vite-plugin-pwa (PWA)
- Lucide React (图标)
- 无后端、无状态管理库 (使用 Context + useReducer)
- RPC 协议: ws / wss / http / https (支持加密连接)

## 编码约定

### 命名
- 文件/目录: PascalCase 仅用于组件文件
- 组件: PascalCase, 默认导出页面组件, 具名导出业务组件
- Hooks: useXxx 格式
- 类型: PascalCase
- 枚举: PascalCase
- 普通变量/函数: camelCase
- 常量: UPPER_SNAKE_CASE (魔术字符串除外)

### 目录规则
- `src/pages/` — 页面级组件 (路由对应)
- `src/components/` — 可复用 UI 组件
- `src/hooks/` — 自定义 Hooks
- `src/context/` — React Context
- `src/api/` — aria2 RPC 通信层
- 每个组件文件 ≤ 200 行

### 样式
- 依赖 Tailwind CSS 类名, 不写自定义 CSS
- 使用 `max-w-*` + `mx-auto` 控制移动端布局
- iPhone 基准宽度 390px

### 类型
- 全部 aria2 RPC 类型定义在 `src/api/types.ts`
- Props 使用 interface (type 仅用于联合类型)
- 避免 `any`, 使用 `unknown` 替代

### AI 约束
- **先思考再编码**：明确假设，暴露取舍，困惑就问。动手前陈述计划
- **简单至上**：最少代码，不做推测性工作，不实现未要求的功能
- **手术刀式改动**：只动必须动的，不改动相邻代码/格式，不重构没坏的东西
- **目标驱动执行**：先列验证步骤，循环直到通过
- 不要引入新的 npm 包除非明确要求
- 不要使用 fetch/axios 等库 — 使用原生 fetch/WebSocket
- 不要创建后端相关文件
- 不要写内联样式
- 不要修改 docs/ 中的文档除非要求更新
- 每个 Phase 完成后更新 AGENTS.md 状态

## GitHub Pages 信息
- base: /AriaDash-web/
- 构建输出: dist/
- 部署分支: gh-pages (自动)
