# 部署错误修复指南

## 错误 1: Missing script: "build" ✅ 已修复

### 问题原因
Cloudflare 的构建系统期望项目有一个 `build` 脚本。

### 解决方案
已在根目录 `package.json` 中添加了 `build` 脚本。

---

## 错误 2: Missing entry-point to Worker script ⚠️ 当前问题

### 问题原因
部署命令 `npx wrangler deploy` 在根目录执行，但 `wrangler.toml` 配置文件在 `worker/` 子目录中。Wrangler 找不到配置文件。

### 解决方案

**方法 1: 在 Cloudflare Dashboard 中修改部署命令（推荐）**

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages** > 选择您的 Worker
3. 进入 **Settings** > **Builds & Deployments**
4. 找到 **Deploy command** 字段
5. 将 `npx wrangler deploy` 改为：
   ```
   cd worker && npx wrangler deploy
   ```
6. 保存并重新部署

**方法 2: 在根目录创建 wrangler.toml（不推荐）**

如果无法修改部署命令，可以在根目录创建一个 `wrangler.toml`，但需要调整路径。

**方法 3: 使用根目录的 deploy 脚本**

在根目录 `package.json` 中添加 `deploy` 脚本：

```json
"deploy": "cd worker && npx wrangler deploy"
```

然后在 Cloudflare Dashboard 中将部署命令改为：`npm run deploy`

---

## 快速修复步骤

### 步骤 1: 添加根目录 deploy 脚本

在根目录 `package.json` 中添加：

```json
"deploy": "cd worker && npx wrangler deploy"
```

### 步骤 2: 在 Cloudflare Dashboard 中修改部署命令

1. 进入 Worker 设置
2. 将 **Deploy command** 从 `npx wrangler deploy` 改为 `npm run deploy`
3. 保存并重新部署

### 步骤 3: 提交更改

```bash
git add package.json
git commit -m "fix: add deploy script in root package.json"
git push
```

---

## 验证

部署应该会成功。如果还有问题，请检查：

1. **Worker 配置是否正确**
   - 确认 `worker/wrangler.toml` 中的配置正确
   - 确认数据库 ID 已正确设置（不是 `your-database-id-here`）

2. **环境变量是否配置**
   - `DOMAIN` = `aihcolamail.xyz`（必需）
   - `RESEND_API_KEY`（可选）

3. **D1 数据库是否已创建和初始化**
   - 确认数据库已创建
   - 确认已执行 `schema.sql`
