# 前端部署指南

## 当前状态

✅ **后端（Worker）**：已部署到 Cloudflare Workers  
⏳ **前端（React）**：需要单独部署到 Cloudflare Pages

---

## 部署前端到 Cloudflare Pages

### 方法 1: 通过 Cloudflare Dashboard（推荐）

这是最简单的方法，通过 GitHub 自动部署。

#### 步骤 1: 确保代码已推送到 GitHub

```bash
git add .
git commit -m "准备部署前端"
git push
```

#### 步骤 2: 在 Cloudflare Dashboard 中创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** > **Connect to Git**
5. 如果还没连接 GitHub，先授权连接
6. 选择您的仓库（`AIHCOLA/aihcolamail` 或您的仓库名）
7. 点击 **Begin setup**

#### 步骤 3: 配置构建设置

在配置页面中设置：

- **Project name**: `temp-email-frontend`（或您喜欢的名称）
- **Production branch**: `main`（或 `master`，根据您的默认分支）
- **Framework preset**: `Vite`（Cloudflare 会自动检测）
- **Build command**: 
  ```
  cd frontend && npm install && npm run build
  ```
- **Build output directory**: 
  ```
  frontend/dist
  ```
- **Root directory**: `/`（保持默认）

#### 步骤 4: 配置环境变量

在 **Environment variables** 部分，添加：

- **Variable name**: `VITE_API_URL`
- **Value**: `https://temp-email-worker.你的账户名.workers.dev`
  - 替换为您的实际 Worker URL
  - 可以在 Worker 的 Overview 页面找到

#### 步骤 5: 保存并部署

1. 点击 **Save and Deploy**
2. 等待构建完成（通常 1-2 分钟）
3. 部署成功后，会显示一个 Pages URL，例如：`https://temp-email-frontend.pages.dev`

---

### 方法 2: 通过 Wrangler CLI（命令行）

如果您想通过命令行部署：

#### 步骤 1: 构建前端

```bash
cd frontend
npm install
npm run build
```

#### 步骤 2: 部署到 Cloudflare Pages

```bash
# 设置环境变量（需要先设置一次）
export VITE_API_URL=https://temp-email-worker.你的账户名.workers.dev

# 部署
npx wrangler pages deploy dist --project-name=temp-email-frontend
```

或者创建 `frontend/.env.production` 文件：

```env
VITE_API_URL=https://temp-email-worker.你的账户名.workers.dev
```

然后：

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=temp-email-frontend
```

---

## 配置自定义域名（可选）

部署成功后，可以配置自定义域名：

1. 在 Pages 项目中，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入域名：
   - `mail.aihcolamail.xyz`（推荐，使用子域名）
   - 或 `aihcolamail.xyz`（如果主域名可用）
4. 按照提示配置 DNS 记录
5. 等待 DNS 生效（通常几分钟）

---

## 验证部署

### 1. 检查前端是否正常加载

访问您的 Pages URL 或自定义域名，应该能看到：
- 首页显示"临时邮箱系统"
- 有"立即生成邮箱"按钮
- 界面正常显示（明暗主题切换正常）

### 2. 测试功能

1. 点击"立即生成邮箱"创建一个临时邮箱
2. 复制邮箱地址
3. 向该邮箱发送一封测试邮件
4. 刷新页面，检查邮件是否出现在列表中

### 3. 检查 API 连接

打开浏览器开发者工具（F12）：
- 进入 **Network** 标签页
- 尝试创建邮箱
- 检查 API 请求是否成功（应该返回 200 状态码）
- 如果失败，检查 `VITE_API_URL` 环境变量是否正确

---

## 常见问题

### Q: 前端显示空白页面？

A: 检查：
1. 浏览器控制台是否有错误
2. `VITE_API_URL` 环境变量是否正确配置
3. Worker URL 是否正确（可以在 Worker 的 Overview 页面找到）

### Q: API 请求失败（CORS 错误）？

A: Worker 已经配置了 CORS，如果仍然失败：
1. 检查 Worker 是否正常运行
2. 检查 `VITE_API_URL` 是否指向正确的 Worker URL
3. 确认 Worker 的 CORS 配置正确

### Q: 构建失败？

A: 检查：
1. 构建日志中的错误信息
2. 确保 `frontend/package.json` 中的依赖都正确
3. 尝试本地构建：`cd frontend && npm install && npm run build`

### Q: 如何更新前端？

A: 
- **如果使用 GitHub 连接**：推送代码到仓库，Cloudflare 会自动重新部署
- **如果使用 CLI**：重新运行 `npm run build && npx wrangler pages deploy dist`

---

## 部署后的完整架构

```
用户浏览器
    ↓
Cloudflare Pages (前端)
    ↓ HTTP API 请求
Cloudflare Workers (后端 API)
    ↓
Cloudflare D1 (数据库)
    ↓
Cloudflare Email Routing (接收邮件)
    ↓ Webhook
Cloudflare Workers (处理邮件)
```

---

## 下一步

部署前端后，您的临时邮箱系统就完全可用了！

1. ✅ 后端 Worker 已部署
2. ✅ 前端 Pages 已部署
3. ⏳ 配置 Cloudflare Email Routing（如果还没配置）

然后就可以开始使用了！
