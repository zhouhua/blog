# 安全修复指南

若凭证曾进入 Git 历史或文档，按下面做。**不要**把真实密码、Admin Key 写进仓库。

## 1. 轮换凭证

在 Vercel（或你的密钥管理处）轮换并重新配置：

- Postgres 相关连接串 / 密码
- `ALGOLIA_ADMIN_KEY`（Admin Key，不是 Search-Only Key）

轮换后旧值立即失效。

## 2. 清理仓库中的秘密

- `.env` 必须在 `.gitignore` 中，且永不提交
- 文档只用占位符（如 `your_password`）
- 若历史里仍有 `.env`，用 `git filter-repo`（或同等工具）删路径后再 force-push；先备份仓库

## 3. 本地模板

本地可保留未入库的 `.env`，参考：

```bash
POSTGRES_URL=postgresql://user:password@host:5432/database
GATSBY_ALGOLIA_APP_ID=your_app_id
GATSBY_ALGOLIA_SEARCH_KEY=your_search_only_key
ALGOLIA_ADMIN_KEY=your_admin_key
ALGOLIA_INDEX_ON_BUILD=false
```

## 4. 短链 API

管理接口（创建 / 删除 / 列表）仍应对公网加鉴权；公开跳转仅 `/i/[key]`。
