# 部署结构说明

## 重要说明：一个仓库，两个应用

**您不需要分成两个仓库！** 前端和后端代码可以在**同一个 GitHub 仓库**中，只需要在 Cloudflare 中创建**两个应用**（一个 Worker，一个 Pages）。

---

## 项目结构

```
temp-email-system/          ← 一个 GitHub 仓库
├── frontend/               ← 前端代码（React）
│   ├── src/
│   ├── package.json
│   └── ...
├── worker/                 ← 后端代码（Cloudflare Worker）
│   ├── src/
│   ├── wrangler.toml
│   └── ...
├── wrangler.toml          ← 根目录配置（用于 Worker 部署）
├── package.json
└── ...
```

---

## Cloudflare 中的配置

### 应用 1: Worker（后端 API）

- **类型**: Cloudflare Worker
- **连接**: 同一个 GitHub 仓库
- **配置**:
  - **Root directory**: `/`（根目录）
  - **Build command**: `npm run build`（会执行 `cd worker && npm run build`）
  - **Deploy command**: `npx wrangler deploy`（使用根目录的 `wrangler.toml`）
  - **环境变量**: `DOMAIN`, `RESEND_API_KEY`（可选）

### 应用 2: Pages（前端界面）

- **类型**: Cloudflare Pages
- **连接**: **同一个 GitHub 仓库**
- **配置**:
  - **Root directory**: `/`（根目录）
  - **Build command**: `cd frontend && npm install && npm run build`
  - **Build output directory**: `frontend/dist`
  - **环境变量**: `VITE_API_URL`（指向 Worker 的 URL）

---

## 部署流程

### 第一次部署

#### 1. 确保代码在 GitHub

```bash
git add .
git commit -m "准备部署"
git push origin main
```

#### 2. 部署 Worker（后端）

1. 在 Cloudflare Dashboard 中，进入 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Worker** > **Deploy with Workers**
4. 选择 **Connect to Git**
5. 选择您的仓库
6. 配置：
   - **Root directory**: `/`
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
7. 添加环境变量（在 Settings 中）：
   - `DOMAIN` = `aihcolamail.xyz`
8. 保存并部署

#### 3. 部署 Pages（前端）

1. 在 Cloudflare Dashboard 中，进入 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** > **Connect to Git**
4. 选择**同一个仓库**
5. 配置：
   - **Root directory**: `/`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
6. 添加环境变量：
   - `VITE_API_URL` = `https://temp-email-worker.你的账户名.workers.dev`
7. 保存并部署

---

## 更新代码

当您更新代码时：

1. **提交到 GitHub**：
   ```bash
   git add .
   git commit -m "更新代码"
   git push
   ```

2. **自动部署**：
   - Cloudflare 会自动检测到代码更新
   - Worker 和 Pages 都会自动重新部署
   - 无需手动操作

---

## 优势

✅ **一个仓库管理所有代码**  
✅ **版本控制统一**  
✅ **部署自动化**  
✅ **代码同步更新**

---

## 常见问题

### Q: 如果我想分成两个仓库可以吗？

A: 可以，但不推荐。分成两个仓库会增加管理复杂度，需要分别维护两个仓库的版本。

### Q: 两个应用会互相影响吗？

A: 不会。Worker 和 Pages 是独立的 Cloudflare 应用，只是都连接到同一个 GitHub 仓库。它们使用不同的配置（根目录、构建命令等），互不干扰。

### Q: 如何知道哪个应用对应哪个代码？

A: 
- **Worker 应用**：使用根目录的 `wrangler.toml`，构建 `worker/` 目录
- **Pages 应用**：构建 `frontend/` 目录，输出到 `frontend/dist`

### Q: 可以只更新其中一个吗？

A: 可以。Cloudflare 会检测哪些文件发生了变化：
- 如果只修改了 `frontend/` 下的文件，只有 Pages 会重新部署
- 如果只修改了 `worker/` 下的文件，只有 Worker 会重新部署
- 如果修改了根目录的配置文件，两个应用都可能重新部署

---

## 总结

**一个 GitHub 仓库 + 两个 Cloudflare 应用 = 完整的临时邮箱系统**

- ✅ 代码统一管理
- ✅ 部署自动化
- ✅ 维护简单
