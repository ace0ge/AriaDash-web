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
