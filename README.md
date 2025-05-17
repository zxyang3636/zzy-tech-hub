# ZZY Tech Hub

<div align="center">
  
  <!-- 项目Logo位置 -->
  ![项目Logo](./docs/public/logo.png)
  
  <h3>基于VitePress的技术文档与博客平台</h3>

  <p>一个现代化、高性能的技术知识分享与记录平台</p>
  
  <!-- 项目展示图位置 -->
  <div>
    <img src="https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-17_10-04-37.png" alt="项目截图1" width="400" />
  </div>
  
</div>

## 📚 项目介绍

ZZY Tech Hub是一个使用VitePress构建的技术文档与博客平台，用于分享和记录各种技术知识。主要包含以下内容：

- **后端技术**：Java、SpringCloud、xxl-job、消息推送等
- **前端技术**：Vue3等前端框架与技术
- **面试资料**：Java、MySQL等技术面试指南
- **实用工具**：网址导航、开发资源等

## 🚀 快速开始

### 环境要求

- Node.js 16.0+
- npm 或 pnpm (推荐使用pnpm)

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/zzy-tech-hub.git

# 进入项目目录
cd zzy-tech-hub

# 安装依赖
pnpm install
```

### 本地开发

```bash
# 启动开发服务器
pnpm docs:dev
```

访问 `http://localhost:5173` 查看网站。

### 构建部署

```bash
# 构建静态文件
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

## 🔧 项目结构

```
zzy-tech-hub/
├── docs/                   # 文档目录
│   ├── .vitepress/         # VitePress配置
│   ├── guide/              # 指南文档
│   ├── public/             # 静态资源
│   └── index.md            # 首页
├── node_modules/           # 依赖包
├── .gitignore              # Git忽略文件
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## 📝 内容编辑

要添加或编辑内容，只需在`docs`目录下创建或修改Markdown文件。文件结构将自动反映在网站导航中。

### Markdown示例

```markdown
---
title: 文章标题
description: 文章描述
---

# 文章标题

这是文章内容...
```

## 🔍 功能特点

- 📱 响应式设计，适配各种设备
- 🔍 内置搜索功能
- 🌙 深色模式支持
- 🌐 多语言支持
- 📊 代码高亮和行号显示
- 🖼️ 图片懒加载

<!-- ## 📷 更多项目展示 -->

<!-- 在这里添加更多项目截图 -->
<!-- <div align="center">
  <img src="https://placeholder.com/screenshot2" alt="项目截图2" width="400" />
  <img src="https://placeholder.com/screenshot3" alt="项目截图3" width="400" />
</div> -->


## 🤝 贡献

欢迎提交问题。
