# AriaDash — 组件架构文档

## 1. 组件层级树

```
<App>
  <I18nProvider>
    <Aria2Provider>                          ← Context Provider (连接状态 + 操作方法)
      <HashRouter>
        <Layout>                             ← 全局布局 (h-dvh + max-w-[430px] + mx-auto)
          <Routes>
            ├─ Route "/" → <Home />          ← 主页
            │              ├─ <Header />           ← 顶栏: 标题 + 批量选择入口 + 设置导航
            │              ├─ <Dashboard />        ← 仪表盘 (下载/上传速度 + 活跃数)
            │              └─ <DownloadList>       ← 下载列表 (筛选 tabs + 任务卡片 + 多选栏)
            │                   ├─ <DownloadItem />   ← 单个任务卡片 (滑动手势: useSwipe, clip-path 裁剪)
            │                   │    ├─ <ProgressBar />   ← 进度条
            │                   │    └─ <StatusBadge />   ← 状态图标
            │                   └─ <BatchActionBar />  ← 底部批量操作栏 (多选模式)
            │
            ├─ Route "/task/:gid" → <TaskDetail />  ← 任务详情页
            │                       ├─ 进度/速度/ETA + 操作按钮
            │                       ├─ <CollapsibleSection /> ← 连接状态 (WebSocket + 任务连接数/做种)
            │                       ├─ <CollapsibleSection /> ← 文件列表 (每文件进度+复选框+源数)
            │                       ├─ <CollapsibleSection /> ← 区块信息 (Peer/Server 列表)
            │                       └─ (右滑返回: useSwipe edgeOnly)
            │
            └─ Route "/settings" → <Settings />    ← 设置页
                                 ├─ <ServerConfig />    ← 服务器配置 (地址/端口/Secret/协议)
                                 ├─ <AriaSettings />    ← aria2 全局参数 (并发/限速/续传)
                                 ├─ 版本信息展示
                                 └─ 语言切换器
          </Routes>
          <AddDownloadSheet />            ← 底部弹出 Sheet (URL / Torrent 标签页切换)
              ├─ URL 标签页 → URL 输入表单
              └─ Torrent 标签页 → <TorrentUpload />
        </Layout>
      </HashRouter>
    </Aria2Provider>
  </I18nProvider>
</App>
```

## 2. 组件职责与 Props

### 2.1 页面级组件

| 组件 | 路径 | 职责 | Props |
|------|------|------|-------|
| `Home` | `src/pages/Home.tsx` | 组合 Dashboard + DownloadList + 欢迎页/连接中/错误态 | 无（从 Context 读取） |
| `TaskDetail` | `src/pages/TaskDetail.tsx` | 单任务详情 + 操作按钮 + 右滑返回 + 3 个 CollapsibleSection (连接/文件/区块) + BT 文件选择 | 无（从 URL param 取 gid） |
| `Settings` | `src/pages/Settings.tsx` | 组合 ServerConfig + AriaSettings + 版本信息 + 语言切换器 | 无 |

### 2.2 布局组件

| 组件 | 路径 | 职责 | Props |
|------|------|------|-------|
| `Layout` | `src/components/Layout.tsx` | h-dvh + max-w-[430px] + mx-auto 固定视口布局 | `children` |
| `Header` | `src/components/Header.tsx` | 标题、批量选择入口（☑/× 切换）、设置导航 | `{ batchMode, selectedCount, onToggleBatch }` |
| `BottomNav` | `src/components/BottomNav.tsx` | 主页 / 统计 Tab 切换 | 无 |

### 2.3 业务组件

| 组件 | 路径 | 职责 | Props |
|------|------|------|-------|
| `Dashboard` | `src/components/Dashboard.tsx` | 下载/上传速度 + 活跃数（3 卡片网格） | `{ globalStat: GlobalStat }` |
| `DownloadList` | `src/components/DownloadList.tsx` | 状态筛选 tabs + 任务列表 + 多选模式 + 等待队列排序 + 清除已完成 | `{ batchMode, onBatchModeChange, onAddClick }` |
| `DownloadItem` | `src/components/DownloadItem.tsx` | 单个任务卡片（滑动手势 + clip-path 裁剪，无按钮） | `{ task, batchMode?, selected?, onSelect?, onPause, onUnpause, onRemove }` |
| `ProgressBar` | `src/components/ProgressBar.tsx` | 进度条 | `{ percent: number }` |
| `StatusBadge` | `src/components/StatusBadge.tsx` | 状态图标（无文字） | `{ status: TaskStatus }` |
| `TaskActions` | `src/components/TaskActions.tsx` | 暂停/恢复/删除按钮（仅详情页） | `{ task, onPause, onUnpause, onRemove }` |
| `BatchActionBar` | `src/components/BatchActionBar.tsx` | 底部批量操作栏（暂停/恢复/删除） | `{ selectedCount, hasActive, hasPaused, onBatchPause, onBatchUnpause, onBatchRemove }` |
| `AddDownloadSheet` | `src/components/AddDownloadSheet.tsx` | 底部 Sheet（URL / Torrent 标签页切换） | `{ open, onClose }` |
| `AddUrlForm` | `src/components/AddUrlForm.tsx` | URL / Magnet 输入表单 | `{ onSubmit }` |
| `TorrentUpload` | `src/components/TorrentUpload.tsx` | .torrent 文件选择 + base64 编码 + 上传 | `{ onClose }` |
| `ServerConfig` | `src/components/ServerConfig.tsx` | RPC 配置表单（地址/端口/Secret/wss/https）+ 连接测试 | `{ config, onSave }` |
| `AriaSettings` | `src/components/AriaSettings.tsx` | aria2 全局参数（并发/限速/连接数/续传） | 无（从 Context 读取） |
| `CollapsibleSection` | `src/components/CollapsibleSection.tsx` | 可折叠区块（grid-rows 动画） | `{ title, icon, children, defaultOpen? }` |

## 3. 数据流向

```
useConfig ───> Aria2Provider ───> useAria2 ───> Aria2Client
   ↑                │                            │
   │                │                            │
   ├──<Settings>    │                            │
   │                │                            │
   │    Aria2State: │                            │
   │    ┌ config ───┤                            │
   │    ├ connected │                            │
   │    ├ tasks ────┼──── <DownloadList>          │
   │    ├ globalStat┼──── <Dashboard>             │
   │    └ error     │                            │
   │                │                            │
   └────────────────┤                            │
                    │                            │
   <Home>                                    │
   calls: pauseTask() ───────────────────────┤── useAria2 ──── Aria2Client
          resumeTask()                       │     methods
          removeTask()                       │
          batchPause() / batchResume()       │
          batchRemove()                      │
```

### 2.4 Context 新增方法

在 `Aria2ContextValue` 中新增：

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getTaskDetail` | `gid: string` | `Promise<DownloadTask \| null>` | 获取单个任务最新详情（`aria2.tellStatus`） |
| `getPeers` | `gid: string` | `Promise<PeerInfo[]>` | 获取 BT 任务对等节点列表（`aria2.getPeers`） |
| `getServers` | `gid: string` | `Promise<ServerInfo[]>` | 获取 HTTP/FTP 任务服务器列表（`aria2.getServers`） |

### 2.5 Hooks

| Hook | 路径 | 职责 | 返回值 |
|------|------|------|--------|
| `useSwipe` | `src/hooks/useSwipe.ts` | 触摸手势检测（左滑/右滑/点击） | `{ isSwiping, direction, translateX, revealed, handlers, closeReveal }` |
| | | 支持 `edgeOnly` 参数（详情页右滑返回） | |
| | | swipe 容器使用 `clip-path: inset(0)` 而非 `overflow:hidden`（Safari transform 兼容） | |

### Context 接口

```typescript
interface Aria2ContextValue {
  // 状态
  config: Aria2Config;
  connected: boolean;
  tasks: DownloadTask[];
  globalStat: GlobalStat | null;
  error: string | null;

  // 操作方法
  connect: (config: Aria2Config) => Promise<void>;
  disconnect: () => void;
  addUri: (uri: string, options?: DownloadOptions) => Promise<string>;
  pause: (gid: string) => Promise<void>;
  unpause: (gid: string) => Promise<void>;
  remove: (gid: string, force?: boolean) => Promise<void>;
  refreshTasks: () => Promise<void>;
}
```

## 4. 状态分类

### 4.1 服务器状态 (连接相关)
```
disconnected → connecting → connected → error → disconnected (循环)
```

### 4.2 下载任务状态 (aria2 原生)
```
active → paused → waiting → complete
  ↓                              ↓
error                        removed
```

### 4.3 筛选 tabs (UI 本地状态)
```
all | active | waiting | paused | complete | error | removed
```

## 5. 组件设计约束

- 不允许直接操作 DOM（无 `document.*`、`window.*` 在组件内部）
- 每个组件文件不超过 200 行（超过则拆分子组件）
- Props 使用 TypeScript interface 定义，不使用 inline type
- 默认导出页面组件，具名导出业务组件
- 所有组件使用 Tailwind 类名，不写自定义 CSS（除非极端情况）
