# 部署到 Vercel 和 Cloudflare 域名配置指南

## 部署到 Vercel

### 方法一：本地部署
1. 安装 Vercel CLI：
   ```bash
   npm install -g vercel
   ```

2. 登录 Vercel（首次使用时）：
   ```bash
   vercel login
   ```

3. 使用部署脚本：
   - 生产环境部署：
     ```bash
     ./scripts/deploy-vercel.sh --prod
     ```
   - 预览环境部署：
     ```bash
     ./scripts/deploy-vercel.sh
     ```

### 方法二：通过 GitHub Actions 自动部署
1. 在 Vercel 项目中获取以下信息：
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

2. 在 GitHub 仓库中设置 Secrets：
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

3. 当推送到 main 或 master 分支时会自动部署

## Cloudflare 域名解析配置

要将您的域名从 Cloudflare 指向 Vercel 的部署，请按以下步骤操作：

### 1. 获取 Vercel 分配的域名或 CDN CNAME 目标
部署成功后，Vercel 会提供一个唯一的部署 URL，如：
- Production: `your-project.vercel.app`
- 或自定义域名的部署地址

### 2. 在 Cloudflare 中配置 DNS 记录
登录 Cloudflare 控制面板并导航到 DNS 设置：

#### 对于根域名 (例如 example.com)：
1. 创建一个 `A` 记录：
   - Name: `@`
   - IPv4 Address: `76.76.21.21` (Vercel 推荐的 IP)
   
   或者使用 `CNAME` 记录（如果 Cloudflare 支持 CNAME flattening）：
   - Name: `@`
   - Target: `your-project.vercel.app`

#### 对于子域名 (例如 www.example.com)：
1. 创建一个 `CNAME` 记录：
   - Name: `www`
   - Target: `your-project.vercel.app`

### 3. 设置 SSL/TLS 加密模式
在 Cloudflare SSL/TLS 设置中，建议使用 "Full (strict)" 模式以确保端到端加密。

### 4. 启用代理 (橙色云图标)
确保 DNS 记录旁边的橙色云图标是激活状态，这样流量会经过 Cloudflare 的安全和性能服务。

### 示例配置：
```
记录类型    名称      内容                  代理状态
A          @         76.76.21.21          激活 (橙色)
CNAME      www       your-project.vercel.app  激活 (橙色)
```

## 验证配置
1. 等待 DNS 传播完成（通常需要几分钟到几小时）
2. 访问您的域名验证是否正确指向 Vercel 部署
3. 检查 SSL 证书是否正常工作

## 注意事项
- 使用 CNAME 记录是推荐的方式，因为它允许 Vercel 在不更改 DNS 的情况下处理 IP 地址变化
- 如果您有多个环境（开发、预览、生产），可能需要为每个环境配置不同的 DNS 记录
- 记得更新 Vercel 项目中的 "Domains" 设置以包含您的自定义域名