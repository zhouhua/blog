# 项目改进实施方案

> 基于全面审计结果的系统性改进计划
> 
> 生成时间: 2026-04-03
> 预计完成时间: 4-6 周

---

## 📋 目录

1. [第一阶段：安全加固](#第一阶段安全加固)
2. [第二阶段：性能优化](#第二阶段性能优化)
3. [第三阶段：测试覆盖](#第三阶段测试覆盖)
4. [第四阶段：架构改进](#第四阶段架构改进)
5. [实施时间表](#实施时间表)
6. [成功指标](#成功指标)

---

## 第一阶段：安全加固

**时间**: 立即执行，1-2 天
**优先级**: 🔴 严重

### 1.1 轮换敏感凭证并从 Git 历史删除

#### 问题描述
- `.env` 文件被提交到版本控制
- 包含数据库密码、API 密钥等敏感信息
- 任何有 Git 访问权限的人都可以获取

#### 实施步骤

**步骤 1: 安装 git-filter-repo**

```bash
# macOS
brew install git-filter-repo

# 或使用 pip
pip install git-filter-repo
```

**步骤 2: 备份仓库**

```bash
cp -r /Users/zhouhua/Documents/GitHub/blog /Users/zhouhua/Documents/GitHub/blog-backup
```

**步骤 3: 从 Git 历史中删除 .env**

```bash
cd /Users/zhouhua/Documents/GitHub/blog
git filter-repo --path .env --invert-paths --force
```

**步骤 4: 更新 .gitignore**

```bash
cat >> .gitignore << 'EOF'

# Environment variables
.env
.env.local
.env.*.local
.env.production
EOF
```

**步骤 5: 创建 .env.example**

```bash
cat > .env.example << 'EOF'
# Database Configuration
POSTGRES_URL=postgresql://user:password@host:5432/database
POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/database?pgbouncer=true
POSTGRES_URL_NO_SSL=postgresql://user:password@host:5432/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/database
POSTGRES_USER=your_user
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database

# Algolia Configuration
GATSBY_ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_KEY=your_admin_key

# Sentry Configuration (Optional)
PUBLIC_SENTRY_DSN=your_sentry_dsn

# API Authentication
API_KEY=your_secure_api_key_here
EOF
```

**步骤 6: 轮换所有凭证**

在 Vercel 和 Algolia 控制台中：
- ✅ 重置 Postgres 数据库密码
- ✅ 重新生成 Algolia Admin Key
- ✅ 生成新的 API_KEY（用于 API 认证）

**步骤 7: 更新 Vercel 环境变量**

```bash
# 使用 Vercel CLI 更新
vercel env add POSTGRES_PASSWORD
vercel env add ALGOLIA_ADMIN_KEY
vercel env add API_KEY
```

**步骤 8: 强制推送（警告：会重写历史）**

```bash
git push origin --force --all
git push origin --force --tags
```

#### 验证清单
- [ ] .env 文件已从 Git 历史中删除
- [ ] .env 已添加到 .gitignore
- [ ] .env.example 已创建
- [ ] 所有敏感凭证已轮换
- [ ] Vercel 环境变量已更新
- [ ] 本地 .env 文件包含新凭证

---

### 1.2 为 API 端点添加认证和输入验证

#### 问题描述
- API 端点完全开放，无认证
- 缺少输入验证和长度限制
- 无速率限制，易受 DoS 攻击

#### 实施步骤

**步骤 1: 创建认证中间件**

创建文件 `src/pages/api/_middleware.ts`:

