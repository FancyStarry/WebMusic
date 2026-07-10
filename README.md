<p align="center">
  <img src="client/src/assets/logo.svg" width="120" alt="WebMusic Logo" onerror="this.style.display='none'">
</p>

<h1 align="center">🎵 WebMusic</h1>

<p align="center">
  <strong>自托管音乐流媒体服务 · 简约优雅的听歌体验</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue_3-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/Material_Design_3-6750A4?logo=materialdesign&logoColor=white" alt="Material Design 3">
  <img src="https://img.shields.io/badge/license-GPLv3-blue.svg" alt="License">
</p>

---

## 📖 项目简介

**WebMusic** 是一款基于 **Vue 3 + Express** 的自托管音乐流媒体服务，让你随时随地通过浏览器畅听自己的音乐收藏。无论是本地音乐文件还是远程 WebDAV 服务器上的音乐，WebMusic 都能轻松管理、流畅播放。

> **为什么选择 WebMusic？**
> - 🚫 无需注册第三方平台，数据完全自主掌控
> - 📱 完善的移动端适配，手机浏览器也能畅快体验
> - 🎨 Material Design 3 设计语言，8 种主题色 + 明暗模式
> - 🔌 支持 WebDAV 远程挂载，扩展无限可能

---

## ✨ 功能特性

### 🎶 音乐管理
| 功能 | 说明 |
|------|------|
| **音乐库浏览** | 按歌曲、专辑、艺术家三种维度浏览索引 |
| **智能扫描** | 自动扫描指定目录，提取元数据（标题、艺术家、专辑、封面等） |
| **搜索过滤** | 实时搜索歌曲、专辑、艺术家，精准定位 |
| **多目录支持** | 可配置多个音乐文件夹，组织更灵活 |

### ▶️ 音频播放
| 功能 | 说明 |
|------|------|
| **流式播放** | 支持音频流渐进加载与 HTTP Range 请求 |
| **进度控制** | 进度条拖拽跳转，音量滑块 / 滚轮调节 |
| **播放模式** | 列表循环 / 单曲循环 / 随机播放 |
| **播放队列** | 随时查看和管理即将播放的歌曲 |
| **Media Session** | 支持系统媒体控制（键盘媒体键、锁屏控制） |
| **格式兼容** | 支持 MP3、FLAC、AAC、OGG、WAV、WMA、APE 等常见格式 |

### 📝 歌词系统
| 功能 | 说明 |
|------|------|
| **自动匹配** | 自动从网易云音乐 API 搜索匹配歌词 |
| **LRC 解析** | 支持标准 LRC 格式歌词，合并翻译歌词 |
| **歌词缓存** | 服务器端缓存，避免重复请求 |
| **自定义视图** | 可调字体大小、对齐方式、背景模糊、滚动动画 |
| **全屏模式** | 桌面端双栏布局（歌词 + 专辑封面），沉浸式体验 |

### 📋 播放列表
| 功能 | 说明 |
|------|------|
| **创建歌单** | 自定义名称和描述 |
| **编辑管理** | 添加 / 移除歌曲，支持批量操作 |
| **右键快捷** | 在任何歌曲上右键即可快速添加到歌单 |

### 🎨 界面主题
| 功能 | 说明 |
|------|------|
| **Material Design 3** | 现代化设计语言，圆润流畅的交互体验 |
| **8 种主题色** | 典雅紫、深海蓝、森林绿、烈焰红、暖阳橙、冰晶青、樱花粉、高级灰 |
| **明暗模式** | 一键切换亮色 / 暗色主题，适配不同环境 |

### ☁️ WebDAV 支持
| 功能 | 说明 |
|------|------|
| **远程挂载** | 将 WebDAV 服务器添加为音乐源 |
| **连接测试** | 一键测试 WebDAV 连接是否可用 |
| **透明访问** | 扫描和播放时与本地目录体验一致 |

### 🔐 用户认证
| 功能 | 说明 |
|------|------|
| **首次初始化** | 首次启动自动引导创建管理员账户 |
| **JWT 鉴权** | 基于 Token 的安全认证，7 天有效期 |
| **安全设置** | 设置页面需登录后才能访问 |

---

## 📱 移动端支持

WebMusic 拥有**完善的响应式设计**，在各种屏幕尺寸上都能提供优秀的体验：

### 响应式适配
- **桌面端**（≥1024px）：完整侧边栏、底部播放栏、全屏歌词视图
- **平板端**（768-1023px）：折叠侧边栏，自适应布局
- **移动端**（<768px）：底部导航栏、简化播放栏、全屏歌词

### 移动端专属优化
- **底部导航栏** — 代替侧边栏，提供音乐库、歌单、设置等快捷入口
- **触控友好** — 大尺寸按钮、手势滑动、触控优化的进度条
- **简化布局** — 在小屏上自动隐藏非核心元素，突出音乐内容
- **轻量加载** — 优化资源加载，移动网络下快速响应

> 无需安装 App，打开浏览器即可享受完整的音乐播放体验。

---

## 🚀 快速开始

### 环境要求
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### 安装与运行

```bash
# 1. 克隆或下载项目
git clone https://github.com/your-username/WebMusic.git
cd WebMusic

# 2. 安装所有依赖（前后端一键安装）
npm install

# 开发模式（前后端同时热重载）
npm run dev

# 3. 构建前端生产版本
npm run build

# 4. 启动生产服务器
npm start
```

启动后访问 **http://localhost:3000** 即可进入 WebMusic。

首次访问时会引导你创建管理员账户，之后在设置页面配置音乐目录即可开始扫描和播放。

---

## ⚙️ 配置说明

编辑项目根目录的 `config.json` 文件：

```json
{
  "host": "0.0.0.0",
  "port": 3000,
  "musicDirs": [],
  "ssl": {
    "enabled": false,
    "cert": "./ssl/cert.pem",
    "key": "./ssl/key.pem"
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `host` | string | `"0.0.0.0"` | 监听地址（`0.0.0.0` 表示所有网络接口） |
| `port` | number | `3000` | 监听端口 |
| `musicDirs` | string[] | `[]` | 音乐文件夹路径列表 |
| `ssl.enabled` | boolean | `false` | 是否启用 HTTPS |
| `ssl.cert` | string | `"./ssl/cert.pem"` | SSL 证书文件路径 |
| `ssl.key` | string | `"./ssl/key.pem"` | SSL 私钥文件路径 |

> 音乐目录也可以在 Web 界面中通过 **设置 → 音乐目录** 进行管理，无需手动编辑配置文件。

---

## 🏗️ 项目架构

```
WebMusic/
├── client/                  # 前端 - Vue 3 + Vite
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   │   ├── Sidebar.vue        # 桌面端侧边栏导航
│   │   │   ├── PlayerBar.vue      # 底部播放控制栏
│   │   │   ├── MusicTable.vue     # 歌曲列表表格
│   │   │   ├── AlbumCard.vue      # 专辑卡片
│   │   │   ├── LyricsView.vue     # 歌词展示视图
│   │   │   ├── MobileBottomNav.vue# 移动端底部导航
│   │   │   ├── PlayQueue.vue      # 播放队列
│   │   │   └── ContextMenu.vue    # 右键菜单
│   │   ├── pages/            # 页面视图
│   │   │   ├── Home.vue           # 首页
│   │   │   ├── Library.vue        # 音乐库（歌曲/专辑/歌手）
│   │   │   ├── AlbumDetail.vue    # 专辑详情
│   │   │   ├── ArtistDetail.vue   # 歌手详情
│   │   │   ├── Playlists.vue      # 歌单列表
│   │   │   ├── PlaylistDetail.vue # 歌单详情
│   │   │   ├── Settings.vue       # 设置页
│   │   │   └── Login.vue          # 登录页
│   │   ├── stores/           # 全局状态管理 (Pinia)
│   │   ├── styles/           # 主题样式 (MD3)
│   │   └── composables/      # 组合式函数
│   └── vite.config.js
├── server/                   # 后端 - Express + SQLite
│   ├── index.js              # 服务入口
│   ├── config.js             # 配置管理
│   ├── db.js                 # 数据库 (better-sqlite3)
│   ├── auth.js               # JWT 认证
│   ├── webdav.js             # WebDAV 客户端
│   ├── middleware/           # 中间件
│   ├── routes/               # API 路由
│   │   ├── music.js          # 歌曲相关 API
│   │   ├── albums.js         # 专辑相关 API
│   │   ├── artists.js        # 歌手相关 API
│   │   ├── playlists.js      # 歌单相关 API
│   │   ├── auth.js           # 认证相关 API
│   │   ├── config.js         # 配置管理 API
│   │   ├── lyrics.js         # 歌词相关 API
│   │   └── scan.js           # 扫描管理 API
│   ├── scanner/              # 音乐扫描器
│   └── services/             # 业务服务
├── config.json               # 运行配置
├── package.json              # Monorepo 配置
└── README.md
```

---

## 🛠️ 技术栈

### 前端
- **框架**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: [Vue Router 4](https://router.vuejs.org/)
- **构建工具**: [Vite 6](https://vitejs.dev/)
- **UI 风格**: Material Design 3（自研 CSS 主题）
- **字体**: Noto Sans SC（思源黑体）
- **图标**: Material Symbols

### 后端
- **框架**: [Express](https://expressjs.com/)
- **数据库**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **认证**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **元数据**: [music-metadata](https://github.com/Borewit/music-metadata)
- **远程协议**: [WebDAV](https://github.com/perry-mitchell/webdav-client)

---

## 📜 许可证

本项目基于 **GNU General Public License v3.0** 开源协议发布。

```
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.
```

---

<p align="center">
  <strong>WebMusic</strong> — 用你喜欢的方式，听你喜欢的音乐。
</p>
