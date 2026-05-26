# AriaDash — 组件架构文档

## 1. 组件层级树

```
<App>
  <Aria2Provider>                          ← Context Provider (连接状态 + 操作方法)
    <BrowserRouter>
      <Layout>                             ← 全局布局 (顶栏 + Sheet + 主内容)
        ├─ <Header />                      ← 顶栏: 标题 + 批量选择入口 + 设置 + 连接指示灯
        │
        ├─ <Routes>
        │   ├─ Route "/" → <Home />        ← 主页
        │   │              ├─ <Dashboard />      ← 仪表盘 (速度卡片 + 统计)
        │   │              └─ <DownloadList>     ← 下载列表 (含多选状态)
        │   │                   ├─ <StatusTabs />     ← 状态筛选 tabs
        │   │                   ├─ <DownloadItem />   ← 单个任务卡片 (map, 无按钮)
        │   │                   │    ├─ <ProgressBar />   ← 进度条
        │   │                   │    └─ <StatusBadge />   ← 状态标签
        │   │                   │    (手势: useSwipe hook)
        │   │                   └─ <BatchActionBar />  ← 底部批量操作栏 (多选模式)
        │   │
        │   ├─ Route "/task/:gid" → <TaskDetail />  ← 任务详情页
        │   │                       ├─ 详情信息 (文件大小/速度/ETA)
        │   │                       ├─ <TaskActions /> ← 操作按钮 (仅详情页)
        │   │                       ├─ <CollapsibleSection /> ← 连接状态 (WebSocket+任务连接数)
        │   │                       ├─ <CollapsibleSection /> ← 文件列表 (每文件进度条+源数)
        │   │                       ├─ <CollapsibleSection /> ← 区块信息 (Peer/Server列表)
        │   │                       └─ (右滑返回: useSwipe edgeOnly)
        │   │
        │   └─ Route "/settings" → <Settings />    ← 设置页
        │                        └─ <ServerConfig />   ← 服务器配置表单
        │
        ├─ <AddDownloadSheet />            ← 底部弹出 Sheet (Portal)
        │   ├─ <AddUrlForm />              ← URL / Magnet 输入
        │   └─ <TorrentUpload />           ← 种子文件上传
        │
        └─ <BottomNav />                   ← 底部 Tab 导航
    </BrowserRouter>
  </Aria2Provider>
</App>
```

## 2. 组件职责与 Props

### 2.1 页面级组件

| 组件 | 路径 | 职责 | Props |
|------|------|------|-------|
| `Home` | `src/pages/Home.tsx` | 组合 Dashboard + DownloadList | 无（从 Context 读取） |
| `TaskDetail` | `src/pages/TaskDetail.tsx` | 单任务详情 + 操作按钮 + 右滑返回 + 三个 CollapsibleSection (连接状态/文件列表/区块信息) | 无（从 URL param 取 gid） |
| `Settings` | `src/pages/Settings.tsx` | 组合 ServerConfig + 主题/关于 | 无 |

### 2.2 布局组件

| 组件 | 路径 | 职责 | Props |
|------|------|------|-------|
| `Layout` | `src/components/Layout.tsx` | 顶栏 + 内容区 + Sheet + TabBar | `children` |
| `Header` | `src/components/Header.tsx` | 标题、批量选择入口、设置导航、连接指示灯 | `{ onToggleBatch? }` |
| `BottomNav` | `src/components/BottomNav.tsx` | 主页 / 统计 Tab 切换 | 无 |

### 2.3 业务组件

| 组件 | 路径 | 职责 | Props |
|------|------|------|-------|
| `Dashboard` | `src/components/Dashboard.tsx` | 全局下载/上传速度、统计 | `{ globalStat: GlobalStat }` |
| `DownloadList` | `src/components/DownloadList.tsx` | 状态 tabs + 任务列表 + 多选模式管理 | `{ batchMode, onSelect }` |
| `DownloadItem` | `src/components/DownloadItem.tsx` | 单个任务卡片（无按钮，手势驱动） | `{ task: DownloadTask; batchMode?; selected?; onSelect? }` |
| `ProgressBar` | `src/components/ProgressBar.tsx` | 进度条 | `{ percent: number }` |
| `StatusBadge` | `src/components/StatusBadge.tsx` | 状态文字标签 | `{ status: TaskStatus }` |
| `TaskActions` | `src/components/TaskActions.tsx` | 暂停/恢复/删除按钮（仅详情页使用） | `{ task: DownloadTask }` |
| `BatchActionBar` | `src/components/BatchActionBar.tsx` | 底部批量操作栏 | `{ selected: Set<string>; onBatchPause; onBatchResume; onBatchRemove }` |
| `AddDownloadSheet` | `src/components/AddDownloadSheet.tsx` | 底部 Sheet 容器 | `{ open: boolean; onClose }` |
| `AddUrlForm` | `src/components/AddUrlForm.tsx` | URL / Magnet 输入表单 | `{ onSubmit: (urls: string[], opts) => void }` |
| `TorrentUpload` | `src/components/TorrentUpload.tsx` | 种子文件选择 + 上传 | `{ onSubmit: (file: File, opts) => void }` |
| `ServerConfig` | `src/components/ServerConfig.tsx` | RPC 配置输入 + 连接测试 | 无（读写 useConfig + useAria2） |
| `SpeedChart` | `src/components/SpeedChart.tsx` | 速度折线图 | `{ data: SpeedPoint[] }` |
| `CollapsibleSection` | `src/components/CollapsibleSection.tsx` | 可折叠区块（点击标题展开/收起，grid 动画） | `{ title, icon, children, defaultOpen? }` |

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
| `useSwipe` | `src/hooks/useSwipe.ts` | 触摸手势检测（左滑/右滑/点击） | `{ isSwiping, direction, translateX, handlers, reset }` |
| | | 支持 `edgeOnly` 参数（详情页右滑返回） | |

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
