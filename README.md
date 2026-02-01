# 临时邮箱系统

一个功能完整的临时邮箱系统，支持发送和接收邮件，部署在 Cloudflare 平台上。

## 功能特性

- ✅ 随机邮箱地址生成
- ✅ 邮件接收（通过 Cloudflare Email Routing）
- ✅ 邮件发送（通过 Resend API）
- ✅ 美观的现代化 UI（Figma 风格）
- ✅ 自适应明暗主题
- ✅ 实时邮件列表更新
- ✅ 邮件详情查看
- ✅ 响应式设计

## 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Cloudflare Pages

### 后端
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- Cloudflare Email Routing
- Resend API

## 项目结构

```
temp-email-system/
├── frontend/          # 前端项目
├── worker/            # Cloudflare Worker 后端
├── schema.sql         # 数据库 Schema
└── README.md
```

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install

# 安装 Worker 依赖
cd ../worker && npm install
```

### 本地开发

#### 1. 配置 Worker

编辑 `worker/wrangler.toml`，更新数据库 ID（需要先创建数据库，见部署指南）。

#### 2. 启动开发服务器

```bash
# 终端 1: 启动 Worker 开发服务器
cd worker
npm run dev

# 终端 2: 启动前端开发服务器
cd frontend
npm run dev
```

前端将在 `http://localhost:3000` 运行，Worker 将在 `http://localhost:8787` 运行。

## 部署

### 1. 配置 Cloudflare D1 数据库

```bash
cd worker
npx wrangler d1 create temp-email-db
```

### 2. 初始化数据库

```bash
npx wrangler d1 execute temp-email-db --file=../schema.sql
```

### 3. 配置环境变量

在 `worker/wrangler.toml` 中配置：
- `RESEND_API_KEY`: Resend API 密钥
- `DOMAIN`: 你的域名 (aihcolamail.xyz)

### 4. 部署 Worker

```bash
cd worker
npm run deploy
```

### 5. 配置 Cloudflare Email Routing

1. 在 Cloudflare Dashboard 中进入 Email Routing
2. 添加路由规则，将邮件转发到 Worker Webhook
3. Worker URL: `https://your-worker.your-subdomain.workers.dev/api/email/receive`

### 6. 部署前端

```bash
cd frontend
npm run build
npm run deploy
```

## 环境变量

### Worker 环境变量

- `RESEND_API_KEY`: Resend API 密钥
- `DOMAIN`: 邮箱域名 (aihcolamail.xyz)

## 许可证

MIT
