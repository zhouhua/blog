# 全面落地自动化测试

## Goal

建立可长期维护的自动化测试门禁：CI 必跑 lint + test；补齐共享库、短链 API helpers，以及 link / gradient / calc-excel 三个 project 的纯逻辑单测。挡住回归，又不引入第二套测试栈或 E2E。

## Background

- 已有 Vitest + Testing Library（jsdom），`pnpm test`；6 文件 / 18 用例全过
- 约定见 `.trellis/spec/frontend/quality-guidelines.md`：抽 `_logic.ts` 再测；不另起测试运行器；不为类名调整上 Playwright
- blurry 已示范 `_logic.ts` + `_logic.test.ts`
- 无 GitHub Actions；本地 pre-commit 仅 lint-staged
- Vercel 安装用 pnpm 10.x（`vercel.json`）

## Requirements

1. **CI**：GitHub Actions 在 `push` / `pull_request` 跑 `pnpm lint` + `pnpm test`；失败即红；**不跑** `build`
2. **lib 单测**：为可纯测的共享助手补 Vitest（至少覆盖 `tag`、`utils` 中的纯函数、`projects` 的 size 数据不变量；`html` 缺口按需补）
3. **API helpers 单测**：`base62`、`createLinkSchema` / `deleteLinkSchema` / `getLinkSchema` 的成功与失败路径
4. **project `_logic`**：为 `link`、`gradient`、`calc-excel` 抽出可测纯函数并补 `_logic.test.ts`（UI / toast / DOM 留在组件）
5. **可选脚本**：提供 `pnpm test:coverage` 便于本地查看；**不上** coverage 硬门槛
6. 不引入第二套测试运行器；不上 Playwright / E2E

## Out of Scope

- E2E / Playwright / 视觉回归
- `pnpm build` 进 CI
- coverage 硬门槛或 PR coverage bot
- 补测 / 改 lint `src/react/ui/`
- 全站 React 组件渲染测试、装饰性快照
- `node.ts` / `logger.ts` / Algolia 网路侧（副作用或外部依赖，本轮不强制）

## Acceptance Criteria

- [x] `.github/workflows/` 存在 CI：PR 与 push 跑 lint + test，失败即红，且不含 build
- [x] `pnpm test` 覆盖新增 lib / API / 三个 project `_logic` 用例，本地与 CI 一致通过
- [x] `link`、`gradient`、`calc-excel` 各有 `_logic.ts` + `_logic.test.ts`，组件行为不因抽取而改变
- [x] 存在 `test:coverage` 脚本（可选本地用），CI 不因覆盖率失败
- [x] 未新增第二套测试框架

## Decisions（已收敛）

| # | Decision | Choice |
|---|----------|--------|
| 1 | 范围 | CI + 关键单测，不做 E2E |
| 2 | CI 命令 | 仅 lint + test |
| 3 | 单测层 | lib + API + project `_logic` |
| 4 | Project | link + gradient + calc-excel |
| 5 | Coverage | 不上硬门槛；可加本地 coverage 脚本 |

## Open Questions

（无）
