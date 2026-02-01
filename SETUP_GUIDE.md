# 环境配置指南

## 1. Node.js 和 npm 安装检查

### ✅ 检查是否已安装

您的系统已经安装了：
- **Node.js**: v20.5.0 ✅ (要求 18+)
- **npm**: 9.8.0 ✅

### 📥 如果未安装（其他用户参考）

#### Windows 系统

1. **方法一：使用官方安装包（推荐）**
   - 访问 [Node.js 官网](https://nodejs.org/)
   - 下载 LTS 版本（长期支持版，通常是 18.x 或 20.x）
   - 运行安装程序，按提示完成安装
   - 安装完成后会自动包含 npm

2. **方法二：使用包管理器**
   ```powershell
   # 使用 Chocolatey
   choco install nodejs
   
   # 或使用 Scoop
   scoop install nodejs
   ```

3. **验证安装**
   ```bash
   node --version
   npm --version
   ```

#### macOS 系统

1. **使用 Homebrew（推荐）**
   ```bash
   brew install node
   ```

2. **或下载官方安装包**
   - 访问 [Node.js 官网](https://nodejs.org/)
   - 下载 macOS 安装包

#### Linux 系统

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用包管理器
sudo apt update
sudo apt install nodejs npm
```

---

## 2. 获取 Resend API 密钥

Resend 是一个现代化的邮件发送服务，免费版每月提供 3000 封邮件。

### 📝 注册 Resend 账户

1. **访问 Resend 官网**
   - 打开浏览器，访问：https://resend.com
   - 点击右上角的 **"Sign Up"** 或 **"Get Started"**

2. **注册账户**
   - 可以使用 GitHub 账户快速注册（推荐）
   - 或使用邮箱注册
   - 填写必要信息完成注册

3. **验证邮箱**
   - 检查注册邮箱，点击验证链接

### 🔑 创建 API 密钥

1. **登录 Dashboard**
   - 登录后会自动进入 Dashboard
   - 如果没有，访问：https://resend.com/api-keys

2. **创建 API 密钥**
   - 点击 **"Create API Key"** 按钮
   - 输入密钥名称（例如：`temp-email-system`）
   - 选择权限（选择 **"Full Access"** 或 **"Sending Access"**）
   - 点击 **"Add"** 创建

3. **复制 API 密钥**
   - ⚠️ **重要**：API 密钥只会显示一次，请立即复制保存
   - 密钥格式类似：`re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 建议保存到安全的地方（密码管理器）

### 🌐 验证域名（可选，但推荐）

为了发送邮件，您需要验证域名 `aihcolamail.xyz`：

1. **添加域名**
   - 在 Resend Dashboard 中，进入 **"Domains"**
   - 点击 **"Add Domain"**
   - 输入域名：`aihcolamail.xyz`
   - 点击 **"Add"**

2. **配置 DNS 记录**
   - Resend 会提供需要添加的 DNS 记录
   - 通常包括：
     - SPF 记录
     - DKIM 记录
     - DMARC 记录（可选）
   - 在 Cloudflare Dashboard 中添加这些 DNS 记录

3. **等待验证**
   - DNS 记录生效可能需要几分钟到几小时
   - Resend 会自动验证域名状态

### 📋 配置到项目中

#### 方法一：使用 Wrangler CLI（推荐，用于生产环境）

```bash
cd worker
npx wrangler secret put RESEND_API_KEY
```

然后输入您的 Resend API 密钥。

#### 方法二：在 Cloudflare Dashboard 中设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择您的 Worker（部署后）
4. 进入 **Settings** > **Variables**
5. 在 **Environment Variables** 部分：
   - **Variable name**: `RESEND_API_KEY`
   - **Value**: 粘贴您的 API 密钥
6. 点击 **Save**

#### 方法三：本地开发（临时使用）

创建 `worker/.dev.vars` 文件（不要提交到 Git）：

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DOMAIN=aihcolamail.xyz
```

⚠️ **注意**：`.dev.vars` 文件已在 `.gitignore` 中，不会被提交。

---

## 3. 验证配置

### 测试 Node.js 环境

```bash
# 检查 Node.js 版本（应该是 18+）
node --version

# 检查 npm 版本
npm --version

# 检查 npm 是否正常工作
npm --help
```

### 测试 Resend API（可选）

您可以使用以下命令测试 Resend API 是否配置正确：

```bash
# 使用 curl 测试（需要先设置环境变量）
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@aihcolamail.xyz",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'
```

---

## 4. 常见问题

### Q: Node.js 版本太低怎么办？

A: 卸载旧版本，从 [Node.js 官网](https://nodejs.org/) 下载最新 LTS 版本重新安装。

### Q: npm 命令找不到？

A: 确保 Node.js 安装时选择了 "Add to PATH" 选项，或重新安装 Node.js。

### Q: Resend API 密钥在哪里找到？

A: 登录 Resend Dashboard > API Keys，如果之前没有保存，需要创建新的密钥。

### Q: 域名验证失败？

A: 
- 检查 DNS 记录是否正确添加
- 等待 DNS 传播（最多 48 小时）
- 确保域名在 Cloudflare 管理
- 检查 Resend Dashboard 中的错误提示

### Q: 免费版限制是什么？

A: Resend 免费版：
- 每月 3000 封邮件
- 每天 100 封邮件
- 支持 API 访问
- 需要验证域名

---

## 5. 下一步

完成以上配置后，您可以：

1. 继续按照 `DEPLOYMENT.md` 进行部署
2. 或先进行本地开发测试

```bash
# 安装项目依赖
npm install
cd frontend && npm install
cd ../worker && npm install

# 启动本地开发服务器
cd worker && npm run dev  # 终端 1
cd frontend && npm run dev  # 终端 2
```

---

## 需要帮助？

如果遇到问题，可以：
1. 查看 [Resend 文档](https://resend.com/docs)
2. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. 检查项目的 `DEPLOYMENT.md` 文件
