# Design: 自动化测试落地

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│ GitHub Actions  │────▶│ pnpm lint        │
│ push / PR       │     │ pnpm test        │
└─────────────────┘     └────────┬─────────┘
                                 │
                    Vitest (jsdom, 现有配置)
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
   src/lib/*.test.ts    src/pages/api/*.test.ts    projects/*/ _logic.test.ts
```

沿用现有 Vitest include：`src/**/*.test.ts(x)`。不新增 Playwright、不改 test runner。

## Boundaries

| Layer | Test what | Do not test |
|-------|-----------|-------------|
| `src/lib` | 纯函数：`toTagSlug`、`readingTime`、`dateRange`、`formatDate`；`sizeOptions` 不变量 | `getRoot`（fs）、logger、Algolia 网络 |
| `src/pages/api` | `base62`；Zod schema safeParse 成功/失败 | `_db`（Postgres）、真实 HTTP handler |
| project `_logic` | 可确定性输入→输出的纯函数 | toast、axios、DOM、html2canvas、XLSX 文件 IO |

## Project extraction plan

### link

UI 与网络耦合重。抽：

- `buildShortUrl(origin, key)` — 列表复制 / 创建成功共用的短链拼接
- `isApiSuccess(code)` 或等价的响应码判断（若能无痛抽出）
- 可选：表格 `fuzzyFilter` 保持在组件或挪到 `_logic`（依赖 `@tanstack/match-sorter-utils`，测 passed/failed 即可）

校验规则已在 API `createLinkSchema` 覆盖，前端不以再复制一套 Zod 为目标。

### gradient

从 `_index.tsx` 的 `useMemo` / 导出字符串抽：

- `deriveGradientStops(baseHex, mode, rng)` — `solid` vs `gradient`；`rng` 可注入以便单测确定性
- `buildLinearGradientCss(rotate, c1, c2, c3)` / `buildGradientSvgMarkup(...)` — 字符串契约

随机用注入的 `rng`（默认现有 `es-toolkit/math` `random`），测试传入固定函数。

### calc-excel

从 `handleCalculate` 抽：

```ts
findRowExceedingThreshold({
  sheetData, columns, selectedColumn, threshold
}) →
  | { ok: true; rowNumber; cumulativeSum; rowData }
  | { ok: false; reason: 'missing-column' | 'invalid-threshold' | 'column-not-found' | 'not-exceeded'; cumulativeSum? }
```

组件只负责 toast 与 `setResult`。Sheet 加载仍留在组件（XLSX）。

## CI design

- Workflow：`.github/workflows/ci.yml`
- Triggers：`push`、`pull_request`（可限默认分支 + PR）
- Node：LTS（与本地接近的 22.x）
- Package manager：启用 corepack；pnpm 版本与 `vercel.json` 的 10.x 对齐，避免 lockfile 漂移
- Steps：`pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test`
- 不加 coverage upload / build

## Coverage script

`package.json`：

```json
"test:coverage": "vitest run --coverage"
```

需确认 `@vitest/coverage-v8` 是否已装；若无则作为 devDependency 补上。CI **不**调用该脚本。

## Trade-offs

| Choice | Why |
|--------|-----|
| 不测 API route handler | 依赖 Vercel Postgres；schema + base62 已覆盖契约核心 |
| link 抽取偏薄 | 业务在服务端 schema；前端以 URL 拼接与可测 filter 为主，避免为测而过度拆 UI |
| gradient 注入 rng | 保留产品随机性，同时单测可复现 |
| CI 无 build | 用户已选；build 吃内存，留给部署流水线 |

## Rollback

- 删 `.github/workflows/ci.yml` 即可关 CI
- `_logic` 抽取若行为偏差：以对应 `_logic.test.ts` + 手工打开三个 project 页回归
