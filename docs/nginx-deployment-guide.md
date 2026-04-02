# 业余无线电考试学习平台 - Nginx 部署指南

## 概述
本文档介绍如何在 nginx 服务器上部署基于 Vite + React 的单页应用（SPA）。

## 准备工作
1. 确保已构建项目: `npm run build`
2. 确保 dist 目录在服务器上有正确的权限

## nginx 配置说明

### 主要配置要点

#### 1. 静态资源处理
- JS/CSS 文件: 设置长期缓存（1年），添加正确的 MIME 类型
- 图片/字体文件: 设置长期缓存（1年）
- 特殊文件（manifest.json, manifest.webmanifest, sw.js等）: 设置特定的 MIME 类型和缓存策略

#### 2. 单页应用路由
- 所有非文件请求都被重定向到 index.html
- 保持 API 请求正常转发到后端（如有）

#### 3. 安全头设置
- 为 service worker 设置正确的允许头部
- 为 manifest 文件设置适当的 MIME 类型

## 部署步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 上传构建文件
将 `dist` 目录中的所有文件上传到服务器的目标目录

### 3. 应用 nginx 配置
1. 编辑 nginx 配置文件
2. 替换 `server_name` 为你的域名
3. 替换 `root` 路径为实际的 dist 目录路径
4. 测试配置：`sudo nginx -t`
5. 重新加载配置：`sudo nginx -s reload`

## 常见问题排查

### 1. 控制台错误 "Failed to load module script"
- 检查 JS 文件的 MIME 类型是否正确
- 确认 nginx 配置中是否设置了正确的 Content-Type

### 2. manifest.json 403 错误
- 确认文件存在于 dist 目录中
- 检查 nginx 配置中的路径和权限设置

### 3. 路由刷新返回 404
- 检查 nginx 配置中的 `try_files` 指令是否正确设置

### 4. Service Worker 无法注册
- 检查 sw.js 的路径和头部设置
- 确保设置了正确的 Service-Worker-Allowed 头部

## 性能优化

### 1. 缓存策略
- 静态资源（JS/CSS/图片）: 一年缓存，带有哈希值保证更新
- HTML 文件: 较短缓存时间，允许快速更新

### 2. 压缩设置
建议在 nginx 中启用 gzip 压缩：
```
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## SSL 配置建议

如果使用 HTTPS，请确保：
1. Service Worker 只能在 HTTPS 环境下运行
2. 为所有静态资源使用 HTTPS 链接
3. 设置适当的安全头部

## 验证部署

部署完成后，验证以下几点：
1. 网站正常加载
2. PWA 功能正常工作（manifest.json、service worker）
3. 所有路由可以正常访问
4. 静态资源（CSS、JS、图片）正确加载
5. 没有控制台错误