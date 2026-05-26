# AriaDash — 决策日志

> 记录开发过程中的关键决策、理由及其影响。

---

## 2026-05-26

### [Phase 0] 项目初始化

**选型: React + TypeScript + Vite**
- 背景: 纯前端 SPA，连接 aria2 JSON-RPC
- 抉择: 选择 React 18 + Vite 6 + TypeScript 5
- 理由: 生态成熟、HMR 快速、类型安全
- 影响: 后续安装依赖约 200MB，构建产物约 100KB

**协议策略: 优先 WebSocket，降级 HTTP**
- 背景: aria2 同时支持 HTTP POST 和 WebSocket 两种 JSON-RPC 传输
- 抉择: 默认 WebSocket（无 CORS + 推送通知），WebSocket 失败则 HTTP POST + 轮询
- 理由: WebSocket 避免 CORS 问题，且 aria2 支持事件推送，减少轮询开销
- 影响: Aria2Client 需封装两种传输层，但对外接口一致

**部署: GitHub Pages + GitHub Actions**
- 背景: 纯静态文件，无后端
- 抉择: GitHub Pages + CI/CD 自动构建发布
- 理由: 免费、无缝集成、支持自定义域名
- 影响: vite.config 需设置 base 为仓库名

**样式: Tailwind CSS v4**
- 背景: 移动优先设计，iPhone 适配
- 抉择: Tailwind CSS v4（非 v3）
- 理由: v4 性能更好、配置更简洁（CSS-first config）、更小体积
- 影响: 如果遇到 iOS Safari 兼容问题，可能需要 injectCSS 模式

**PWA: vite-plugin-pwa**
- 背景: 需要 manifest + Service Worker 支持 iPhone 主屏幕添加
- 抉择: vite-plugin-pwa 而非手动配置
- 理由: 自动生成 SW、注入 manifest、处理缓存策略
- 影响: 需要额外测试 iOS 17+ PWA 行为（splash screen、状态栏颜色等）

**iOS 优先: iPhone 15 Pro (390×844)**
- 背景: 目标设备是 iPhone
- 抉择: 以 iPhone 15 Pro 尺寸为设计基准，iPad/Mac 暂不考虑
- 理由: 聚焦核心场景，减少适配成本
- 影响: 所有线框图基于此尺寸，CSS 使用 max-width 约束，不处理大屏布局

**纯前端 + 直连 aria2 RPC**
- 背景: 用户不希望搭建后端服务
- 抉择: 浏览器直接连接 aria2 JSON-RPC，无中间层
- 理由: 零运维、零服务器成本、隐私优先
- 影响: 需要用户自行确保 aria2 可通过网络访问；部分浏览器可能限制跨域 WebSocket

### [Phase 0 Rev.] 交互设计更新

**卡片无按钮，手势驱动操作**
- 背景: 卡片下方的操作按钮易误触
- 抉择: 移除卡片内所有按钮，改用左滑/右滑手势
- 理由: iPhone 用户习惯滑动手势（邮件/消息 App 的标准化交互），卡片更干净，降低误触率
- 影响: 需要实现 useSwipe hook，touch 事件处理 + CSS 动画

**批量选择通过 Header 按钮进入**
- 背景: 曾计划使用长按手势触发批量选择
- 抉择: 放弃长按，改用 Header 右上角 ☑ 按钮 toggle 多选模式
- 理由: 长按与 iOS 文本选择/上下文菜单冲突，防御方案过于复杂，按钮方案确定性强、零冲突
- 影响: Header 需增加批量选择入口，新增 BatchActionBar 组件

**详情页右滑边缘返回**
- 背景: 点击卡片进入详情页后，需要返回列表
- 抉择: iOS 原生风格右滑边缘返回 + 左上角 ← 返回按钮
- 理由: 符合 iPhone 用户的操作预期，useSwipe hook 复用，仅需 edgeOnly 参数做边缘限制
- 影响: useSwipe 需支持 edgeOnly 模式，TaskDetail 页面需注入 swipe 动画（手指跟随位移 + 回弹）

---

## 2026-05-26 (后续迭代)

### [Tier 1] aria2 全局参数设置 / 任务排序 / 清除已完成

**全局参数设置表单 (AriaSettings)**
- 背景: 用户需要修改 max-concurrent-downloads 等全局参数
- 抉择: 全新 AriaSettings 组件嵌入 Settings 页面，读取/写入 getGlobalOption/changeGlobalOption
- 理由: 无需新页面，复用 Settings 已有的滚动布局
- 影响: Aria2Client 新增 getGlobalOption / changeGlobalOption 方法，Context 暴露

**任务排序 (↑↓ 按钮)**
- 背景: 等待队列的任务需要调整顺序
- 抉择: 在等待筛选标签页的任务卡片左侧添加 ↑↓ 按钮
- 理由: 语义清晰，逐位调整精确控制；changePosition RPC 支持 POS_CUR 偏移
- 影响: DownloadList 需区分筛选标签，仅 waiting 标签显示排序按钮

**清除已完成任务**
- 背景: 完成/已删除的任务仍显示在列表中
- 抉择: 在"完成"筛选标签旁添加"清除已完成"按钮，调用 purgeDownloadResult
- 影响: 新增 purgeDownloadResult RPC 方法

**种子文件上传 (TorrentUpload)**
- 背景: 需要支持 .torrent 文件添加下载
- 抉择: AddDownloadSheet 新增"种子文件"标签页，切换 URL / Torrent 输入方式
- 理由: addTorrent 需要 base64 编码文件内容，与 addUri 参数不同，需独立表单
- 影响: 新增 TorrentUpload 组件，AddDownloadSheet 改成标签页切换，Aria2Client 新增 addTorrent 方法

**BT 文件选择**
- 背景: 种子文件中可选择性下载部分文件
- 抉择: 在文件列表折叠区（paused/waiting 状态）显示复选框，选择后点击"应用文件选择"按钮
- 理由: aria2 的 select-file 参数需要在开始前设置，限定暂停/等待状态
- 影响: TaskDetail 文件列表增加复选框逻辑 + changeOption RPC

### [i18n] 国际化支持

**自定义 i18n 系统**
- 背景: 需要中英文双语，但 react-intl 等库体积大
- 抉择: 自建 I18nProvider + useI18n hook，字典文件 zh.ts/en.ts
- 理由: 简单直接，零依赖，体积极轻（en 动态 import 仅 ~1.8KB）
- 影响: t() 函数通过点号路径查找，支持 {key} 模板插值；en 字典通过动态 import 加载实现代码分割

### [Safari 兼容] overflow:hidden + transform 裁剪失效

**clip-path 替代 overflow:hidden**
- 背景: iOS Safari 上 `overflow:hidden` 父元素无法正确裁剪应用了 CSS `transform: translateX()` 的子元素（swipe 动画）
- 抉择: 将 DownloadItem 的 `overflow-hidden` 替换为 `clip-path: inset(0 round 12px)`
- 理由: clip-path 在 Safari 上能正确作用于 GPU 合成层，且同 overflow:hidden 一样将子元素限制在父边界内
- 影响: 需要精确匹配 border-radius（rounded-xl = 12px）；全局附加 `html, body, #root { overflow-x: hidden }` 兜底

### [CI/CD] 单 Job 构建部署

**合并 build + deploy 为单 job**
- 背景: 多 job 时代码构建（centralus）成功，但部署 job 的 runner 区域（northcentralus）无法从 codeload.github.com 下载 actions/deploy-pages@v4
- 抉择: 删除独立 deploy job，全部放在同一 job 中顺序执行 checkout → build → upload-pages-artifact → deploy-pages
- 理由: build job 的区域能正常下载所有 action，同一 job 避免切换 runner
- 影响: permissions 需要 pages: write + id-token: write；Pages source 需设为 "GitHub Actions"
