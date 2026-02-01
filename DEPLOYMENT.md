# 部署指南

本指南将帮助您将临时邮箱系统部署到 Cloudflare。

## 前置要求

1. **Cloudflare 账户**（免费版即可）
2. **域名 `aihcolamail.xyz` 已在 Cloudflare 管理**
3. **Node.js 18+ 和 npm**（仅用于本地开发和部署，如果使用 Cloudflare Dashboard 部署则不需要）
4. **Resend API 密钥**（可选，仅当需要发送邮件功能时）

> 💡 **重要说明**：
> - **本地开发**：需要 Node.js 和 npm 来运行 Wrangler CLI 进行本地测试
> - **Cloudflare 部署**：可以直接在 Cloudflare Dashboard 中部署，无需本地环境
> - **邮件发送**：Cloudflare Email Routing 只能接收邮件，不能发送。如果需要发送功能，需要配置 Resend 或其他邮件服务
> - **仅接收邮件**：如果只需要接收验证码等功能，可以不配置 Resend API 密钥

## 步骤 1: 安装依赖（可选）

> ⚠️ **注意**：如果您计划完全在 Cloudflare Dashboard 中部署，可以跳过此步骤。但建议先本地测试。

### 选项 A: 本地开发（推荐先测试）

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装 Worker 依赖
cd ../worker
npm install
```

### 选项 B: 仅使用 Cloudflare Dashboard

如果您不想在本地安装 Node.js，可以直接在 Cloudflare Dashboard 中：
1. 通过 GitHub 连接部署前端（Cloudflare Pages）
2. 通过 Dashboard 创建和配置 Worker
3. 通过 Dashboard 配置环境变量

> 📖 **详细说明**：查看 [CLOUDFLARE_ONLY_DEPLOY.md](./CLOUDFLARE_ONLY_DEPLOY.md) 了解完全在 Cloudflare 中部署的步骤。

## 步骤 2: 创建 Cloudflare D1 数据库

```bash
cd worker
npx wrangler d1 create temp-email-db
```

执行后会输出数据库 ID，类似：
```
✅ Successfully created DB 'temp-email-db'!
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via snapshots to R2.

[[d1_databases]]
binding = "DB"
database_name = "temp-email-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

将 `database_id` 复制到 `worker/wrangler.toml` 文件中。

## 步骤 3: 初始化数据库

```bash
npx wrangler d1 execute temp-email-db --file=../schema.sql
```

## 步骤 4: 配置 Worker

编辑 `worker/wrangler.toml`：

1. 更新 `database_id`（从步骤 2 获取）
2. 确认 `DOMAIN` 变量为 `aihcolamail.xyz`

## 步骤 5: 设置环境变量

### 必需的环境变量

在 Cloudflare Dashboard 中设置 Worker 环境变量：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择你的 Worker（如果还没创建，先部署一次）
4. 进入 **Settings** > **Variables**
5. 添加以下环境变量：
   - `DOMAIN`: `aihcolamail.xyz`（必需）

### 可选的环境变量（仅当需要发送邮件功能时）

- `RESEND_API_KEY`: 你的 Resend API 密钥

> 💡 **说明**：
> - 如果只需要接收邮件（临时邮箱的主要用途），可以不配置 `RESEND_API_KEY`
> - 如果不配置 `RESEND_API_KEY`，发送邮件功能将不可用，但接收功能完全正常
> - Cloudflare Email Routing 已经可以完美处理邮件接收，无需额外配置

#### 使用命令行设置（如果使用 Wrangler CLI）：

```bash
cd worker
# 设置域名（必需）
npx wrangler secret put DOMAIN
# 输入: aihcolamail.xyz

# 设置 Resend API 密钥（可选）
npx wrangler secret put RESEND_API_KEY
# 输入你的 Resend API 密钥（如果需要发送功能）
```

#### 在 Cloudflare Dashboard 中设置：

1. 进入 Worker 的 **Settings** > **Variables**
2. 在 **Environment Variables** 部分添加：
   - `DOMAIN` = `aihcolamail.xyz`
   - `RESEND_API_KEY` = `你的密钥`（可选）

## 步骤 6: 部署 Worker

```bash
cd worker
npm run deploy
```

部署成功后，记录 Worker 的 URL（例如：`https://temp-email-worker.your-subdomain.workers.dev`）

## 步骤 7: 配置 Cloudflare Email Routing

1. 在 Cloudflare Dashboard 中，进入你的域名 `aihcolamail.xyz`
2. 进入 **Email** > **Email Routing**
3. 如果还没有启用，先启用 Email Routing
4. 添加路由规则：
   - **规则名称**: 接收所有邮件
   - **如果收件人是**: `*@aihcolamail.xyz`
   - **则执行操作**: **发送到 HTTP 端点**
   - **HTTP 端点 URL**: `https://your-worker-url.workers.dev/api/email/receive`
   - **HTTP 方法**: POST

## 步骤 8: 配置前端环境变量

创建 `frontend/.env.production`：

```env
VITE_API_URL=https://your-worker-url.workers.dev
```

## 步骤 9: 部署前端到 Cloudflare Pages

### 方法 1: 通过 GitHub（推荐）

1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Dashboard 中，进入 **Pages**
3. 点击 **Create a project** > **Connect to Git**
4. 选择你的仓库
5. 配置构建设置：
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`
6. 添加环境变量：
   - `VITE_API_URL`: `https://your-worker-url.workers.dev`
7. 点击 **Save and Deploy**

### 方法 2: 通过 Wrangler CLI

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=temp-email-frontend
```

## 步骤 10: 配置自定义域名（可选）

在 Cloudflare Pages 设置中，添加自定义域名 `aihcolamail.xyz` 或子域名（如 `mail.aihcolamail.xyz`）。

## 验证部署

1. 访问前端页面
2. 点击"立即生成邮箱"创建一个临时邮箱
3. 向该邮箱发送一封测试邮件
4. 检查邮件是否出现在邮件列表中

## 故障排除

### 邮件接收不工作

1. 检查 Email Routing 配置是否正确
2. 检查 Worker URL 是否正确
3. 查看 Worker 日志：`npx wrangler tail`

### 前端无法连接 API

1. 检查 `VITE_API_URL` 环境变量是否正确
2. 检查 Worker CORS 配置
3. 检查浏览器控制台错误

### 数据库错误

1. 确认数据库已正确创建和初始化
2. 检查 `wrangler.toml` 中的数据库配置
3. 重新运行数据库迁移

## 关于邮件发送功能

### Cloudflare Email Routing 的限制

**重要**：Cloudflare Email Routing **只能接收邮件，不能发送邮件**。它主要用于：
- ✅ 接收发送到您域名的邮件
- ✅ 将邮件转发到 HTTP 端点（我们的 Worker）
- ❌ **不支持**通过 API 发送邮件

### 如果需要发送邮件功能

如果您需要发送邮件功能（例如：回复邮件、主动发送通知等），需要配置第三方邮件服务：

#### 选项 1: Resend（推荐，免费版每月 3000 封）

1. 访问 [Resend.com](https://resend.com)
2. 注册账户（免费版每月 3000 封邮件）
3. 在 Dashboard 中创建 API 密钥
4. 将密钥添加到 Worker 环境变量 `RESEND_API_KEY`

#### 选项 2: 其他邮件服务

- Mailgun（免费版每月 5000 封）
- SendGrid（免费版每天 100 封）
- AWS SES（按使用量付费）

### 如果只需要接收邮件

**完全不需要配置任何发送服务**！临时邮箱系统的主要用途就是接收验证码和邮件，Cloudflare Email Routing 已经完美支持这个功能。

## 注意事项

- Cloudflare 免费版有请求限制，但通常足够个人使用
- Resend 免费版每月 3000 封邮件
- D1 数据库免费版有存储和请求限制
- 建议定期备份数据库
