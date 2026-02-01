# 完全在 Cloudflare 中部署（无需本地 Node.js）

本指南适用于不想在本地安装 Node.js 的用户，所有操作都在 Cloudflare Dashboard 中完成。

## 前置要求

1. Cloudflare 账户（免费版即可）
2. 域名 `aihcolamail.xyz` 已在 Cloudflare 管理
3. GitHub 账户（用于部署前端）

## 步骤 1: 准备代码仓库

1. 将代码推送到 GitHub 仓库
2. 确保仓库是公开的，或者连接 Cloudflare 到您的 GitHub 账户

## 步骤 2: 创建 Cloudflare D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **D1**
3. 点击 **Create database**
4. 输入数据库名称：`temp-email-db`
5. 选择区域（选择离您最近的）
6. 点击 **Create**

## 步骤 3: 初始化数据库

1. 在 D1 数据库列表中，点击刚创建的 `temp-email-db`
2. 进入 **Settings** 标签页
3. 在 **Database ID** 旁边复制数据库 ID
4. 进入 **Console** 标签页
5. 打开项目中的 `schema.sql` 文件
6. 复制所有 SQL 语句
7. 粘贴到 D1 Console 中
8. 点击 **Run** 执行

## 步骤 4: 创建 Cloudflare Worker

### 方法 A: 通过 GitHub 连接（推荐）

1. 在 Cloudflare Dashboard 中，进入 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Create Worker**
4. 输入 Worker 名称：`temp-email-worker`
5. 点击 **Deploy**

### 方法 B: 直接上传代码

1. 在 **Workers & Pages** 中，点击 **Create Worker**
2. 选择 **Upload Worker**
3. 将 `worker/src` 目录下的所有文件内容合并到一个文件中
4. 或者使用 Wrangler CLI（如果已安装）

## 步骤 5: 配置 Worker 代码

1. 在 Worker 编辑器中，将以下代码合并到 `index.ts`：

```typescript
// 合并 worker/src 目录下的所有文件
// 需要手动合并 router.ts, handlers/*.ts, utils/*.ts 的内容
```

> 💡 **提示**：由于 Cloudflare Dashboard 编辑器限制，建议使用 Wrangler CLI 或通过 GitHub 连接部署。

## 步骤 6: 配置 Worker 绑定

1. 在 Worker 的 **Settings** > **Variables and Secrets**
2. 添加以下绑定：
   - **D1 Database**: 选择 `temp-email-db`
   - **Variable name**: `DB`

## 步骤 7: 设置环境变量

在 Worker 的 **Settings** > **Variables and Secrets** 中：

1. **Environment Variables** 部分：
   - `DOMAIN` = `aihcolamail.xyz`（必需）

2. **Secrets** 部分（可选，仅当需要发送邮件时）：
   - `RESEND_API_KEY` = `你的 Resend API 密钥`

## 步骤 8: 配置 Cloudflare Email Routing

1. 在 Cloudflare Dashboard 中，选择您的域名 `aihcolamail.xyz`
2. 进入 **Email** > **Email Routing**
3. 如果还没有启用，点击 **Get started** 启用 Email Routing
4. 进入 **Routing rules** 标签页
5. 点击 **Create address**
6. 配置规则：
   - **规则名称**: `接收所有邮件`
   - **如果收件人是**: `*@aihcolamail.xyz`（使用通配符）
   - **则执行操作**: 选择 **Send to HTTP endpoint**
   - **HTTP 端点 URL**: `https://temp-email-worker.你的账户名.workers.dev/api/email/receive`
   - **HTTP 方法**: `POST`
7. 点击 **Save**

## 步骤 9: 部署前端到 Cloudflare Pages

1. 在 Cloudflare Dashboard 中，进入 **Workers & Pages** > **Pages**
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 连接您的 GitHub 账户（如果还没连接）
5. 选择包含代码的仓库
6. 点击 **Begin setup**
7. 配置构建设置：
   - **Project name**: `temp-email-frontend`
   - **Production branch**: `main` 或 `master`
   - **Framework preset**: `Vite`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`**
8. 在 **Environment variables** 部分添加：
   - `VITE_API_URL` = `https://temp-email-worker.你的账户名.workers.dev`
9. 点击 **Save and Deploy**

## 步骤 10: 配置自定义域名（可选）

1. 在 Pages 项目中，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入域名：`mail.aihcolamail.xyz` 或 `aihcolamail.xyz`
4. 按照提示配置 DNS 记录

## 验证部署

1. 访问您的前端 URL（Pages 提供的 URL 或自定义域名）
2. 点击"立即生成邮箱"创建一个临时邮箱
3. 向该邮箱发送一封测试邮件
4. 检查邮件是否出现在邮件列表中

## 常见问题

### Q: 如何在 Dashboard 中编辑 Worker 代码？

A: Cloudflare Dashboard 的编辑器功能有限，建议：
- 使用 GitHub 连接自动部署
- 或使用 Wrangler CLI（需要本地 Node.js）

### Q: 如何查看 Worker 日志？

A: 在 Worker 页面中，进入 **Logs** 标签页可以查看实时日志。

### Q: 如何更新 Worker 代码？

A: 如果通过 GitHub 连接，推送代码到仓库会自动部署。否则需要在 Dashboard 中手动编辑。

## 优势与限制

### 优势
- ✅ 无需本地安装 Node.js
- ✅ 所有操作在浏览器中完成
- ✅ 自动部署和更新

### 限制
- ⚠️ Dashboard 编辑器功能有限
- ⚠️ 调试不如本地环境方便
- ⚠️ 代码合并需要手动操作

## 推荐方案

**最佳实践**：使用 GitHub 连接 + Wrangler CLI（本地测试）
- 本地使用 Wrangler CLI 开发和测试
- 通过 GitHub 自动部署到 Cloudflare
- 享受两全其美的体验
