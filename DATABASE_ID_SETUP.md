# 如何获取和配置 D1 数据库 ID

## 错误信息

```
binding DB of type d1 must have a valid `id` specified [code: 10021]
```

这个错误表示 `wrangler.toml` 中的 `database_id` 不是有效的数据库 ID。

---

## 步骤 1: 获取数据库 ID

### 方法 A: 通过 Cloudflare Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击左侧菜单中的 **D1**
4. 找到您的数据库 `temp-email-db`
5. 点击数据库名称进入详情页
6. 在 **Settings** 标签页中，找到 **Database ID**
7. 复制这个 ID（格式类似：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

### 方法 B: 通过命令行（如果已创建）

如果您之前通过命令行创建过数据库，可以在创建时的输出中找到 ID。

### 方法 C: 如果还没有创建数据库

如果还没有创建数据库，请先创建：

```bash
cd worker
npx wrangler d1 create temp-email-db
```

执行后会输出类似：
```
✅ Successfully created DB 'temp-email-db'!

[[d1_databases]]
binding = "DB"
database_name = "temp-email-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← 这就是您需要的 ID
```

---

## 步骤 2: 更新 wrangler.toml

### 更新根目录的 wrangler.toml

1. 打开项目根目录的 `wrangler.toml` 文件
2. 找到这一行：
   ```toml
   database_id = "your-database-id-here"
   ```
3. 替换为实际的数据库 ID：
   ```toml
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```
   （将 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 替换为您从 Dashboard 复制的实际 ID）

### 同时更新 worker/wrangler.toml（如果存在）

如果 `worker/wrangler.toml` 中也有 `database_id`，也需要更新：

1. 打开 `worker/wrangler.toml`
2. 找到 `database_id = "your-database-id-here"`
3. 替换为相同的实际数据库 ID

---

## 步骤 3: 提交并推送

```bash
git add wrangler.toml worker/wrangler.toml
git commit -m "fix: update database_id with actual D1 database ID"
git push
```

---

## 步骤 4: 初始化数据库（如果还没有）

如果数据库还没有初始化表结构，需要执行：

```bash
cd worker
npx wrangler d1 execute temp-email-db --file=../schema.sql
```

或者在 Cloudflare Dashboard 中：
1. 进入 D1 数据库页面
2. 选择 `temp-email-db`
3. 进入 **Console** 标签页
4. 打开项目中的 `schema.sql` 文件
5. 复制所有 SQL 语句
6. 粘贴到 Console 中
7. 点击 **Run** 执行

---

## 验证

更新 `database_id` 并提交后，重新部署应该会成功。您应该看到：

```
✅ Successfully deployed!
Your worker has access to the following bindings:
- D1 Databases:
  - DB: temp-email-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)  ← 应该是真实的 ID
```

---

## 常见问题

### Q: 找不到数据库怎么办？

A: 如果 Dashboard 中没有数据库，需要先创建：
```bash
cd worker
npx wrangler d1 create temp-email-db
```

### Q: 数据库 ID 格式是什么？

A: 格式类似 UUID：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，例如：`a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Q: 更新后仍然失败？

A: 检查：
1. 数据库 ID 是否正确（没有多余的空格或引号）
2. 数据库是否已创建
3. 是否有权限访问该数据库
