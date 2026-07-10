# WebMusic

基于 Vue 3 + Express 的自托管音乐流媒体服务。

## 功能

- 音乐库管理 — 扫描本地目录，按专辑/艺术家浏览
- 音频流播放 — 支持流式播放与进度条拖拽
- 封面缓存 — 自动提取并缓存专辑封面
- 播放列表 — 创建、编辑、管理自定义播放列表
- 歌词支持 — 自动匹配与手动搜索歌词
- WebDAV 挂载 — 支持远程 WebDAV 作为音乐源
- 用户认证 — 首次启动初始化管理员，JWT 鉴权
- Material Design 3 风格界面

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（前后端热重载）
npm run dev

# 构建前端
npm run build

# 生产模式
npm start
```

## 配置

编辑 `config.json`（首次启动会自动创建默认配置）：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `host` | string | `0.0.0.0` | 监听地址 |
| `port` | number | `3000` | 监听端口 |
| `musicDirs` | string[] | `[]` | 音乐文件扫描目录 |
| `ssl.enabled` | boolean | `false` | 是否启用 HTTPS |
| `ssl.cert` | string | `./ssl/cert.pem` | SSL 证书路径 |
| `ssl.key` | string | `./ssl/key.pem` | SSL 密钥路径 |

## 技术栈

- **前端**: Vue 3, Pinia, Vue Router, Vite
- **后端**: Express, better-sqlite3, bcryptjs, jsonwebtoken
- **协议**: WebDAV (用于远程音乐源)

## License

GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007
