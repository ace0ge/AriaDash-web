# AriaDash

<div align="center">

🚀 **A modern web frontend for aria2 download manager — designed for iPhone.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)
[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github)](https://your-username.github.io/AriaDash-web)
[![iOS](https://img.shields.io/badge/iOS-PWA-000?logo=apple)](https://developer.apple.com)

</div>

> **AriaDash** 是一个面向 iPhone 的 Progressive Web App (PWA)，让你通过浏览器远程管理 aria2 下载任务。无需安装任何应用，无需搭建后端服务。

## Features

- 📱 **iPhone 优化** — 适配 iOS Safari，支持添加到主屏幕全屏运行
- ⚡ **实时更新** — 通过 WebSocket 推送，下载进度即时可见
- 🎯 **完整控制** — 添加、暂停、恢复、删除下载任务
- 🌐 **多协议支持** — HTTP / HTTPS / Magnet / Torrent
- 🔒 **隐私优先** — 直连你的 aria2 服务，数据不上传云端
- 🌙 **深色模式** — 护眼且美观
- 📊 **速度图表** — 实时速度趋势可视化

## Quick Start

1. 确保 aria2 已启动并启用了 RPC:

```bash
aria2c --enable-rpc --rpc-listen-all --rpc-allow-origin-all --rpc-secret=YOUR_SECRET
```

2. 打开 AriaDash: **[https://your-username.github.io/AriaDash-web/](https://your-username.github.io/AriaDash-web/)**

3. 输入你的 aria2 RPC 地址、端口和 Secret Token，点击"保存并开始"

4. 在 Safari 中点击「分享」→「添加到主屏幕」获得 PWA 体验

## Screenshots

> *待添加 — Phase 3 完成后补充*

## Development

```bash
git clone https://github.com/your-username/AriaDash-web.git
cd AriaDash-web
npm install
npm run dev     # 启动开发服务器
npm run build   # 构建生产版本
npm run preview # 预览构建产物
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa |
| RPC | WebSocket / HTTP (JSON-RPC 2.0) |
| Deploy | GitHub Pages (via GitHub Actions) |

## License

[MIT](LICENSE) © your-username
