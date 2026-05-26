# AriaDash — 安全注意事项

## 1. RPC Secret 存储

- **仅存储于 `localStorage`**，不会发送到任何第三方服务器
- Secret 以明文存储（受限于浏览器 localStorage 无法加密）
- 建议 aria2 端使用 HTTPS/WSS 传输层加密 (`--rpc-secure`)
- 如使用公网暴露的 aria2 实例，务必配合 `--rpc-secret` 使用，不要仅依赖 IP 限制

## 2. 传输安全

| 场景 | 推荐 | 说明 |
|------|------|------|
| 局域网 | HTTP + WebSocket | aria2 默认无 TLS，内网使用风险可控 |
| 公网 | HTTPS + WSS | 需要为 aria2 配置 SSL 证书 (`--rpc-certificate`) |

## 3. CORS 策略

- 启用 WebSocket 协议时无 CORS 问题
- HTTP 模式需要 aria2 启动参数 `--rpc-allow-origin-all`
- 本应用不会从其他域名加载数据

## 4. XSS 防护

- React 默认转义所有 JSX 插值，内置 XSS 防护
- aria2 返回的文件名/路径名在渲染前经过 React 转义
- 不使用 `dangerouslySetInnerHTML`
- URI 输入添加 `URL` 格式校验

## 5. 配置导出/导入

- 如未来增加配置导出功能，警告用户 Secret 会以明文形式包含在导出文件中
- 建议导出文件设为 `.gitignore`，避免误提交到 GitHub

## 6. 开源安全

- `.env` 和 `*.local` 文件已加入 `.gitignore`
- GitHub Actions 不会输出或暴露任何密钥
- CI 中不存储任何凭据
