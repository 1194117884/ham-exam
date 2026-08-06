# 部署指南

## 部署方式

项目通过 **Cloudflare Pages** 部署，配置了 GitHub Hook 自动部署：
- 推送到 `main` 分支会自动触发 Cloudflare Pages 构建和部署
- Cloudflare Pages 会执行 `npm run build` 构建项目

## Cloudflare Pages 配置

### 构建设置
- **构建命令**: `npm run build`
- **构建输出目录**: `dist`
- **Node.js 版本**: 18+（推荐 20+）

### 域名
- 生产环境: `https://cqcq.yongkl.cc`

## 本地构建

```bash
# 开发
npm run dev

# 构建（不含预渲染）
npm run build

# 构建 + 预渲染
npm run build:full

# 单独预渲染
npm run prerender
```

## 预渲染说明

SPA 应用默认对搜索引擎不友好（内容由 JS 动态渲染）。预渲染脚本 (`scripts/prerender.mjs`) 使用 Puppeteer 在构建时生成静态 HTML 快照，让 Google 等搜索引擎能即时索引页面内容。

预渲染需要本地安装 Chrome 浏览器。如果 Chrome 不可用，预渲染会自动跳过，不影响构建。

要提交预渲染的 HTML 文件到仓库：
```bash
npm run build:full
git add dist/practice dist/exam dist/wrong-book dist/favorites
git commit -m "chore: 更新预渲染 HTML"
```