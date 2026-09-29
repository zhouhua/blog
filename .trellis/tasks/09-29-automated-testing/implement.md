# Implement: 自动化测试落地

## Checklist（顺序）

1. **CI 基建**
   - [x] 新增 `.github/workflows/ci.yml`（lint + test，corepack/pnpm，frozen lockfile）
   - [x] 确认 Node / pnpm 版本与仓库一致

2. **lib 单测**
   - [x] `src/lib/tag.test.ts` — `toTagSlug`
   - [x] `src/lib/utils.test.ts` — `readingTime` / `dateRange` / `formatDate`（必要时轻测 `cn`）
   - [x] `src/lib/projects.test.ts` — sizeOptions：正宽高、labelKey 唯一等不变量
   - [x] 按需补 `html.test.ts` 缺口（若实现中发现明显未覆盖分支）

3. **API helpers 单测**
   - [x] `src/pages/api/_utils.test.ts` — `base62` 边界（0/小/大）
   - [x] `src/pages/api/_schemas.test.ts` — create/delete/get schema 合法与非法输入

4. **project：calc-excel**
   - [x] 抽出 `findRowExceedingThreshold` → `_logic.ts`
   - [x] `_index.tsx` 改为调用 logic + toast
   - [x] `_logic.test.ts`：命中行 / 未超过 / 非法阈值 / 缺列

5. **project：gradient**
   - [x] 抽出 stops 推导 + CSS/SVG 字符串构建 → `_logic.ts`（rng 可注入）
   - [x] `_index.tsx` 接线
   - [x] `_logic.test.ts`：solid / gradient（固定 rng）/ 字符串片段断言

6. **project：link**
   - [x] 抽出 `buildShortUrl`（及值得测的纯片段）→ `_logic.ts`
   - [x] `_link.tsx` 接线
   - [x] `_logic.test.ts`

7. **Coverage 脚本（无门槛）**
   - [x] 如缺则加 `@vitest/coverage-v8`
   - [x] `package.json` 增加 `test:coverage`

8. **验证**
   - [x] `pnpm test`
   - [x] `pnpm lint`（至少改动文件无新错）
   - [x] 抽查三个 project 页面手动点一次关键路径（创建短链 UI、gradient 导出参数、excel 计算）

9. **Spec 回写（收尾）**
   - [x] 若 CI / coverage 脚本成为新约定，更新 `.trellis/spec/frontend/quality-guidelines.md`

## Validation commands

```bash
pnpm test
pnpm lint
# 可选
pnpm test:coverage
```

## Risky files

- `src/pages/projects/gradient/_index.tsx` — 随机色与导出 DOM 交织，抽取时保持视觉默认行为
- `src/pages/projects/link/_link.tsx` — 避免为测而大拆 React Table
- `src/pages/projects/calc-excel/_index.tsx` — toast 文案依赖 reason，映射要完整

## Rollback points

- CI：删除 workflow
- 各 project：保留 `_logic` 测试失败时回退组件内联实现（git revert 单目录）

## Before `task.py start`

- [x] prd / design / implement 已写
- [x] implement.jsonl / check.jsonl 已写入真实 spec 条目
- [x] 用户批准本规划摘要
