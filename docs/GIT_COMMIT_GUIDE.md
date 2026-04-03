# Git 提交指南

> 建议分批提交，每个功能一次提交

---

## 提交顺序

### 1. 安全加固 - 添加输入验证

```bash
git add src/pages/api/_schemas.ts
git add src/pages/api/link.ts
git commit -m "feat(api): add input validation with Zod schemas

- Create validation schemas for link API endpoints
- Add input validation for POST, GET, DELETE methods
- Return appropriate HTTP status codes (400/404/500)
- Improve error messages with validation details"
```

### 2. 安全加固 - 修复 XSS 漏洞

```bash
git add package.json pnpm-lock.yaml
git add src/react/components/JournalList.tsx
git add src/pages/projects/gradient/_index.tsx
git commit -m "security: fix XSS vulnerabilities

- Install dompurify for HTML sanitization
- Fix XSS in JournalList.tsx with DOMPurify
- Replace innerHTML with safe DOM API in gradient component
- Configure allowed tags and attributes whitelist"
```

### 3. 安全加固 - 改进错误处理和日志

```bash
git add src/lib/logger.ts
git add src/lib/algolia.ts
git commit -m "feat(logging): add unified logging system

- Create Logger class with info/warn/error levels
- Support structured JSON logs in production
- Replace console.error with Logger throughout codebase
- Remove empty catch blocks"
```

### 4. 性能优化 - 修复 React 性能反模式

```bash
git add src/react/components/ProjectList.tsx
git add src/react/hooks/useRecentList.ts
git commit -m "perf(react): optimize component performance

- Optimize ProjectList from O(n²) to O(n) complexity
- Use useMemo for expensive grouping operations
- Remove meaningless useEffect in useRecentList
- Improve rendering efficiency"
```

### 5. 文档 - 添加改进方案和指南

```bash
git add docs/
git commit -m "docs: add comprehensive improvement guides

- Add security fix guide for credential rotation
- Add component refactoring guide
- Add build optimization guide
- Add testing coverage guide
- Add dependency audit guide
- Add monitoring setup guide
- Add implementation plan and summaries"
```

---

## 一次性提交（如果你想快速提交）

```bash
git add .
git commit -m "feat: comprehensive project improvements

Security:
- Add API input validation with Zod
- Fix XSS vulnerabilities with DOMPurify
- Implement unified logging system
- Remove empty catch blocks

Performance:
- Optimize ProjectList complexity (O(n²) → O(n))
- Remove unnecessary useEffect
- Add performance optimization guides

Documentation:
- Add 9 comprehensive improvement guides
- Include security, performance, testing guides
- Provide step-by-step implementation instructions"
```

---

## 提交后的验证

```bash
# 1. 检查提交历史
git log --oneline -5

# 2. 查看文件变更
git show HEAD --stat

# 3. 确认所有文件已提交
git status
```

---

## 推送到远程

```bash
# 推送到远程仓库
git push origin main

# 如果有冲突，先拉取
git pull --rebase origin main
git push origin main
```

---

## ⚠️ 重要提醒

**在推送之前，请务必先执行 `docs/SECURITY_FIX_GUIDE.md` 中的凭证轮换步骤！**

原因：
- .env 文件已泄露到 Git 历史
- 数据库密码和 API 密钥需要立即轮换
- 推送前轮换可以避免新凭证再次泄露

---

## 测试建议

提交前建议测试：

```bash
# 1. 运行 lint 检查
pnpm lint

# 2. 运行类型检查
pnpm build

# 3. 运行测试
pnpm test

# 4. 本地预览
pnpm dev
# 访问 http://localhost:4321 测试功能
```

---

## 回滚方案

如果发现问题需要回滚：

```bash
# 回滚最后一次提交（保留文件修改）
git reset --soft HEAD~1

# 回滚最后一次提交（丢弃文件修改）
git reset --hard HEAD~1

# 回滚到特定提交
git reset --hard <commit-hash>
```
