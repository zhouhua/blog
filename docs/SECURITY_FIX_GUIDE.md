# 安全修复指南 - .env 文件泄露处理

## ⚠️ 严重性说明

.env 文件已被提交到 Git 历史，包含以下敏感信息：
- 数据库密码: `Mvb5uPA3eQCa`
- Algolia Admin Key: `a36941d2594f03fb7f159135fedeb680`
- 完整的数据库连接字符串

**任何有 Git 访问权限的人都可以获取这些凭证。**

---

## 🔧 修复步骤

### 步骤 1: 备份当前仓库

```bash
# 创建备份
cp -r /Users/zhouhua/Documents/GitHub/blog /Users/zhouhua/Documents/GitHub/blog-backup-$(date +%Y%m%d)

echo "✅ 备份已创建"
```

### 步骤 2: 安装 git-filter-repo

```bash
# macOS
brew install git-filter-repo

# 或使用 pip
pip3 install git-filter-repo

# 验证安装
git-filter-repo --version
```

### 步骤 3: 从 Git 历史中删除 .env

```bash
cd /Users/zhouhua/Documents/GitHub/blog

# 删除 .env 文件的所有历史记录
git filter-repo --path .env --invert-paths --force

echo "✅ .env 已从 Git 历史中删除"
```

### 步骤 4: 更新 .gitignore

```bash
# 确保 .env 在 .gitignore 中
cat >> .gitignore << 'GITIGNORE'

# Environment variables (added for security)
.env
.env.local
.env.*.local
.env.production
.env.development
GITIGNORE

git add .gitignore
git commit -m "chore: add .env to .gitignore for security"

echo "✅ .gitignore 已更新"
```

### 步骤 5: 创建 .env.example 模板

```bash
cat > .env.example << 'ENVEXAMPLE'
# Database Configuration (Vercel Postgres)
POSTGRES_URL=postgresql://user:password@host:5432/database
POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/database?pgbouncer=true
POSTGRES_URL_NO_SSL=postgresql://user:password@host:5432/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/database
POSTGRES_USER=your_user
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database

# Algolia Search Configuration
GATSBY_ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_KEY=your_admin_key

# Sentry Error Tracking (Optional)
PUBLIC_SENTRY_DSN=your_sentry_dsn
ENVEXAMPLE

git add .env.example
git commit -m "docs: add .env.example template"

echo "✅ .env.example 已创建"
```

### 步骤 6: 轮换所有敏感凭证

#### 6.1 轮换 Vercel Postgres 密码

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目 → Storage → Postgres
3. 点击 "Settings" → "Reset Password"
4. 复制新的连接字符串

#### 6.2 轮换 Algolia Admin Key

1. 访问 [Algolia Dashboard](https://www.algolia.com/dashboard)
2. 进入 API Keys
3. 删除旧的 Admin Key
4. 创建新的 Admin Key
5. 复制新的 Key

#### 6.3 更新本地 .env 文件

```bash
# 编辑 .env 文件，使用新的凭证
nano .env

# 或使用 VS Code
code .env
```

更新以下字段为新值：
- `POSTGRES_PASSWORD`
- `POSTGRES_URL`（包含新密码）
- `ALGOLIA_ADMIN_KEY`

### 步骤 7: 更新 Vercel 环境变量

```bash
# 使用 Vercel CLI（推荐）
vercel env rm POSTGRES_PASSWORD production
vercel env add POSTGRES_PASSWORD production
# 输入新密码

vercel env rm ALGOLIA_ADMIN_KEY production
vercel env add ALGOLIA_ADMIN_KEY production
# 输入新 Key

# 或者在 Vercel Dashboard 手动更新：
# https://vercel.com/[your-username]/[project-name]/settings/environment-variables
```

### 步骤 8: 强制推送到远程仓库

**⚠️ 警告：这会重写 Git 历史，所有协作者需要重新克隆仓库**

```bash
# 添加远程仓库（如果之前被 git-filter-repo 移除）
git remote add origin https://github.com/[your-username]/blog.git

# 强制推送所有分支
git push origin --force --all

# 强制推送所有标签
git push origin --force --tags

echo "✅ 已强制推送到远程仓库"
```

### 步骤 9: 验证修复

```bash
# 1. 检查 .env 是否在 .gitignore 中
grep -q "^\.env$" .gitignore && echo "✅ .env 在 .gitignore 中" || echo "❌ .env 不在 .gitignore 中"

# 2. 检查 Git 历史中是否还有 .env
git log --all --full-history -- .env
# 应该没有任何输出

# 3. 检查 .env.example 是否存在
[ -f .env.example ] && echo "✅ .env.example 存在" || echo "❌ .env.example 不存在"

# 4. 测试数据库连接
pnpm build
# 应该成功连接到数据库
```

---

## 📋 验证清单

完成后，请确认以下所有项：

- [ ] 已创建仓库备份
- [ ] git-filter-repo 已安装
- [ ] .env 已从 Git 历史中删除
- [ ] .env 已添加到 .gitignore
- [ ] .env.example 已创建
- [ ] Vercel Postgres 密码已轮换
- [ ] Algolia Admin Key 已轮换
- [ ] 本地 .env 已更新为新凭证
- [ ] Vercel 环境变量已更新
- [ ] 已强制推送到远程仓库
- [ ] 验证测试全部通过

---

## 🚨 如果出现问题

### 问题 1: git-filter-repo 报错 "not a fresh clone"

```bash
# 解决方案：添加 --force 参数
git filter-repo --path .env --invert-paths --force
```

### 问题 2: 推送被拒绝

```bash
# 解决方案：使用 --force 强制推送
git push origin --force --all
```

### 问题 3: 构建失败 "database connection error"

```bash
# 检查环境变量是否正确
echo $POSTGRES_URL

# 在 Vercel Dashboard 检查环境变量
# 确保新密码已正确设置
```

### 问题 4: 需要恢复

```bash
# 从备份恢复
rm -rf /Users/zhouhua/Documents/GitHub/blog
cp -r /Users/zhouhua/Documents/GitHub/blog-backup-YYYYMMDD /Users/zhouhua/Documents/GitHub/blog
cd /Users/zhouhua/Documents/GitHub/blog
```

---

## 📞 需要帮助？

如果遇到任何问题，请：
1. 检查备份是否完整
2. 查看 Git 操作日志
3. 联系项目维护者

**重要提示**：完成此修复后，旧的数据库密码和 API 密钥将失效，确保所有服务都使用新凭证。
