# AriaDash — 技术架构文档

## 1. 架构概览

AriaDash 是一个纯前端单页应用 (SPA)，在浏览器中直接通过 JSON-RPC 协议与 aria2 服务通信，不依赖任何后端服务。

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Pages                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │              AriaDash SPA                        │ │
│  │                                                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │ Settings  │  │  Home     │  │  AddDownload  │   │ │
│  │  │  Page     │  │  Page     │  │  (Sheet)      │   │ │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │ │
│  │       │             │               │            │ │
│  │  ┌────┴─────────────┴───────────────┴────┐       │ │
│  │  │         React Context (Aria2Ctx)       │       │ │
│  │  └────────────────┬──────────────────────┘       │ │
│  │                   │                               │ │
│  │  ┌────────────────┴──────────────────────┐       │ │
│  │  │         useAria2 Hook                  │       │ │
│  │  │   (命令封装 + 状态管理 + 连接管理)      │       │ │
│  │  └────────────────┬──────────────────────┘       │ │
│  │                   │                               │ │
│  │  ┌────────────────┴──────────────────────┐       │ │
│  │  │    Aria2Client (RPC 传输层)             │       │ │
│  │  │   ┌─────────┐  ┌──────────┐           │       │ │
│  │  │   │ WebSocket│  │  HTTP    │           │       │ │
│  │  │   │ (主协议)  │  │ (降级)   │           │       │ │
│  │  │   └────┬─────┘  └────┬─────┘           │       │ │
│  │  └────────┼──────────────┼─────────────────┘       │ │
│  └───────────┼──────────────┼──────────────────────────┘ │
│              │              │                            │
└──────────────┼──────────────┼────────────────────────────┘
               │              │
     WebSocket │   HTTP POST  │
     ws://host:6800/jsonrpc   │
               │              │
        ┌──────┴──────────────┴──────────────┐
        │         aria2 RPC Server            │
        │   (运行在你的服务器/NAS/本地)        │
        │   aria2c --enable-rpc --rpc-listen-all --rpc-allow-origin-all
        └─────────────────────────────────────┘
```

## 2. 技术选型

| 类别 | 选择 | 版本 | 理由 |
|------|------|------|------|
| 框架 | React | 18+ | 生态成熟，组件化，Hooks 模式简洁 |
| 语言 | TypeScript | 5+ | 类型安全，RPC 接口强校验 |
| 构建 | Vite | 6+ | 快速 HMR，输出静态文件，GitHub Pages 友好 |
| 样式 | Tailwind CSS | 4 | 原子化 CSS，移动端适配快，体积小 |
| 路由 | React Router | 7 | SPA 路由管理 |
| PWA | vite-plugin-pwa | - | 自动生成 manifest + Service Worker |
| RPC | 原生 fetch + WebSocket | - | 零依赖，直接控制连接生命周期 |
| 部署 | GitHub Actions | - | CI/CD 自动构建发布到 gh-pages |
| 图标 | Lucide React | - | 轻量、一致的图标库 |

## 3. 核心模块设计

### 3.1 RPC 传输层 (`src/api/aria2.ts`)

封装与 aria2 的 JSON-RPC 通信，提供 `Aria2Client` 类：

```
class Aria2Client {
  constructor(config: Aria2Config)
  
  // 连接管理
  connect(): Promise<void>       // 建立 WebSocket / 初始化 HTTP
  disconnect(): void
  
  // 核心 RPC 方法（全部返回 Promise）
  addUri(uris: string[], options?: AddUriOptions): Promise<string>  // 返回 GID
  remove(gid: string): Promise<string>
  pause(gid: string): Promise<string>
  unpause(gid: string): Promise<string>
  tellActive(): Promise<DownloadTask[]>
  tellWaiting(offset: number, num: number): Promise<DownloadTask[]>
  tellStopped(offset: number, num: number): Promise<DownloadTask[]>
  getGlobalStat(): Promise<GlobalStat>
  
  // 事件（WebSocket 模式）
  onNotification(handler: (notification: RpcNotification) => void): void
}
```

**通信协议策略**:
1. 优先尝试 WebSocket（天然无 CORS，支持推送通知）
2. WebSocket 不可用则降级为 HTTP POST（需要 aria2 启动 `--rpc-allow-origin-all`）
3. WebSocket 模式下监听 `aria2.onDownloadComplete` 等通知实现实时更新
4. HTTP 模式下使用轮询 (3s 间隔)

### 3.2 状态管理 (`src/context/Aria2Context.tsx`)

使用 React Context + useReducer 管理全局状态：

```typescript
interface Aria2State {
  config: Aria2Config;           // 服务器配置
  connected: boolean;            // 连接状态
  tasks: DownloadTask[];         // 所有任务列表
  globalStat: GlobalStat | null; // 全局统计
  error: string | null;          // 错误信息
}
```

### 3.3 配置管理 (`src/hooks/useConfig.ts`)

```typescript
function useConfig() {
  // 读写 localStorage 'ariadash-config' key
  // 类型安全，含默认值
  // 变更时自动持久化
}
```

## 4. 数据流

```
用户操作 (点击/输入)
      │
      v
UI 组件调用 useAria2 的方法 (addUri, pause, remove...)
      │
      v
Aria2Client 构造 JSON-RPC 请求
      │
      v
WebSocket / HTTP → aria2 服务
      │
      v
响应解析 → dispatch reducer action
      │
      v
React Context 更新状态
      │
      v
UI 组件 re-render
```

## 5. 目录结构

```
AriaDash-web/
├── docs/                     # 项目文档
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── icons/                # PWA 图标 (含 iOS 各尺寸)
├── src/
│   ├── api/
│   │   ├── types.ts          # ★ 全部 TypeScript 类型定义
│   │   └── aria2.ts          # ★ RPC 客户端实现
│   ├── components/           # UI 组件
│   ├── hooks/                # React Hooks
│   ├── context/              # React Context
│   ├── pages/                # 路由页面
│   ├── App.tsx               # 根组件 + 路由
│   ├── main.tsx              # 入口
│   └── index.css             # Tailwind 入口
├── .github/workflows/        # CI/CD
│   ├── deploy.yml
│   └── ci.yml
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── postcss.config.js
```

## 6. GitHub Pages 部署

- 构建命令: `npm run build`
- 输出目录: `dist/`
- GitHub Actions: 监听 `main` 分支推送，构建后推送到 `gh-pages` 分支
- `vite.config.ts` 中设置 `base: '/AriaDash-web/'`

## 7. 兼容性

### 浏览器支持

| 浏览器 | 最低版本 | 备注 |
|--------|----------|------|
| Safari (iOS) | 16.4+ | 目标平台，完整 PWA 支持 |
| Safari (macOS) | 16.4+ | 桌面端兼容 |
| Chrome | 100+ | 开发调试 |
| Firefox | 100+ | 基本兼容 |

### aria2 要求

| 参数 | 必须 | 说明 |
|------|------|------|
| `--enable-rpc` | 是 | 启用 RPC 接口 |
| `--rpc-listen-all` | 是 | 允许外部访问 |
| `--rpc-allow-origin-all` | 否 (HTTP 模式必须) | 允许跨域（仅 HTTP 模式需要） |
| `--rpc-secret` | 推荐 | 设置访问密钥 |
| `--rpc-listen-port` | 否 | 默认 6800 |
