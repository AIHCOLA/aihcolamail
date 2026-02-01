# 部署错误修复指南

## 错误：Missing script: "build"

### 问题原因

Cloudflare 的构建系统期望项目有一个 `build` 脚本，但 Cloudflare Workers 实际上不需要构建步骤（TypeScript 由 Wrangler 自动处理）。

### 解决方案

已修复：在 `worker/package.json` 中添加了 `build` 脚本。

### 下一步操作

1. **提交更改到 Git**
   ```bash
   git add worker/package.json
   git commit -m "fix: add build script for Cloudflare deployment"
   git push
   ```

2. **重新触发构建**
   - 在 Cloudflare Dashboard 中，点击 **"重试构建"** 按钮
   - 或者推送新的提交到仓库

### 验证

构建应该会成功完成。如果还有其他错误，请检查：

1. **Worker 配置是否正确**
   - 确认 `worker/wrangler.toml` 中的配置正确
   - 确认数据库 ID 已正确设置

2. **环境变量是否配置**
   - `DOMAIN` = `aihcolamail.xyz`（必需）
   - `RESEND_API_KEY`（可选）

3. **D1 数据库是否已创建和初始化**
   - 确认数据库已创建
   - 确认已执行 `schema.sql`

### 如果仍然失败

如果添加 build 脚本后仍然失败，可以尝试：

1. **检查构建命令配置**
   - 在 Cloudflare Dashboard 中，进入 Worker 设置
   - 检查 **Build command** 是否正确
   - 对于 Workers，构建命令应该是：`npm run build`（现在已修复）

2. **使用 Wrangler CLI 部署（替代方案）**
   ```bash
   cd worker
   npm install
   npx wrangler deploy
   ```

3. **检查根目录配置**
   - 如果 Worker 在子目录中，确保 **Root directory** 设置为 `/worker`
   - 或者调整构建命令为：`cd worker && npm run build`
