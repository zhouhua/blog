# 依赖审计指南

> 目标：减少依赖数量 10%+，修复所有安全漏洞

---

## 审计步骤

```bash
# 1. 运行安全审计
pnpm audit

# 2. 分析未使用的依赖
pnpm add -D depcheck
npx depcheck

# 3. 更新过期依赖
pnpm outdated
pnpm update
```

---

## 依赖优化建议

- 移除未使用的 @radix-ui 组件
- 考虑按需导入 react-icons
- 评估是否需要 html2canvas
