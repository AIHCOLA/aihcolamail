# Cloudflare 部署错误修复指南

## 当前错误：Missing entry-point to Worker script

### 问题原因

Cloudflare Dashboard 中的部署命令是 `npx wrangler deploy`，它在**根目录**执行，但 `wrangler.toml` 配置文件在 `worker/` 子目录中。

### 解决方案（两种方法）

---

## 方法 1: 在根目录创建 wrangler.toml（已自动修复）✅

我已经在根目录创建了 `wrangler.toml` 文件，指向 worker 目录的代码。

**重要**：您需要更新 `wrangler.toml` 中的 `database_id`：

1. 打开根目录的 `wrangler.toml`
2. 找到 `database_id = "your-database-id-here"`
3. 替换为实际的数据库 ID（从 Cloudflare Dashboard 获取）

**获取数据库 ID**：
- 登录 Cloudflare Dashboard
- 进入 **Workers & Pages** > **D1**
- 选择 `temp-email-db` 数据库
- 在 **Settings** 标签页中复制 **Database ID**

**提交更改**：
```bash
git add wrangler.toml
git commit -m "fix: add root wrangler.toml for Cloudflare deployment"
git push
```

---

## 方法 2: 在 Cloudflare Dashboard 中修改部署命令（推荐）

如果方法 1 不工作，请在 Cloudflare Dashboard 中修改部署命令：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择您的 Worker 项目
4. 进入 **Settings**（设置）
5. 找到 **Builds & Deployments** 部分
6. 找到 **Deploy command** 字段
7. 将 `npx wrangler deploy` 改为以下任一选项：

   **选项 A**（使用 npm 脚本）：
   ```
   npm run deploy
   ```

   **选项 B**（直接指定目录）：
   ```
   cd worker && npx wrangler deploy
   ```

   **选项 C**（使用配置文件参数）：
   ```
   npx wrangler deploy --config worker/wrangler.toml
   ```

8. 保存设置
9. 重新触发部署

---

## 验证修复

部署成功后，您应该看到：
- ✅ Build command completed
- ✅ Deploy command completed
- ✅ Worker deployed successfully

---

## 如果仍然失败

### 检查清单

1. **数据库 ID 是否正确**
   - 打开根目录的 `wrangler.toml`
   - 确认 `database_id` 不是 `your-database-id-here`
   - 应该是类似 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 的格式

2. **环境变量是否配置**
   - 在 Cloudflare Dashboard 中，进入 Worker 的 **Settings** > **Variables**
   - 确认 `DOMAIN` = `aihcolamail.xyz` 已设置

3. **数据库是否已初始化**
   - 确认 D1 数据库已创建
   - 确认已执行 `schema.sql` 初始化脚本

### 手动部署测试（本地）

如果 Dashboard 部署仍然失败，可以尝试本地部署：

```bash
cd worker
npm install
npx wrangler deploy
```

如果本地部署成功，说明代码没问题，问题在于 Cloudflare 的构建配置。

---

## 推荐方案

**最佳实践**：使用方法 1（根目录 wrangler.toml）+ 更新 database_id

这样 Cloudflare 的默认部署命令 `npx wrangler deploy` 就能正常工作，无需修改 Dashboard 设置。
