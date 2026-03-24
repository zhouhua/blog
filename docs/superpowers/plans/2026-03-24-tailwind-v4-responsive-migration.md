# Tailwind v4 Responsive Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将博客站点的响应式样式全面迁移到 Tailwind CSS v4 标准 `min-width` 语义，并恢复首页、列表页、详情页与交互区在手机、平板和桌面下的稳定布局。

**Architecture:** 先补一层轻量的响应式回归测试入口，再按“公共骨架 -> 核心页面 -> 正文排版 -> 交互收尾”的顺序迁移。实现阶段优先把旧的“窄屏覆盖/区间断点”翻译为可验证的新语义，再收口成真正的 mobile-first 结构，避免在同一轮里同时做大规模视觉重设计。

**Tech Stack:** Astro 6, Tailwind CSS 4, React 19, daisyUI, Node.js `node:test`, Playwright MCP 手动多视口验收

---

## File Structure

- Modify: `src/styles/global.css`
  负责全局 Tailwind v4 主题、基础排版和公共响应式规则；本次迁移的断点基线。
- Modify: `src/components/Container.astro`
  负责全站容器宽度与水平内边距，是所有页面骨架的入口。
- Modify: `src/components/Header.astro`
  负责站点导航、logo、搜索与移动菜单的显隐和布局切换。
- Modify: `src/components/Footer.astro`
  负责全站底部区块的 mobile-first 布局。
- Modify: `src/components/ListTitle.astro`
  负责首页、列表页顶部标题区的主结构。
- Modify: `src/components/ArticleTitle.astro`
  负责文章详情页标题与窄屏/宽屏标题区过渡。
- Modify: `src/components/ProjectTitle.astro`
  负责项目详情页标题区。
- Modify: `src/components/ArticleListItem.astro`
  负责文章卡片在 `rows` 和 `tiles` 两种布局下的响应式行为。
- Modify: `src/components/ArticlesPair.astro`
  负责首页精选文章双列/单列切换。
- Modify: `src/pages/index.astro`
  负责首页分区布局和统计区块。
- Modify: `src/pages/journals/index.astro`
  负责随笔时间线页的复杂区间断点布局。
- Modify: `src/pages/about.astro`
  负责关于页主卡片与头像排布。
- Modify: `src/pages/photos.astro`
  负责照片页容器与图片列表入口。
- Modify: `src/styles/article.module.css`
  负责正文排版系统，是断点使用最密集的样式文件。
- Modify: `src/pages/[...slug].astro`
  负责文章详情页外层骨架和 hero 图区域。
- Modify: `src/pages/[journal].astro`
  负责单篇随笔详情页外层骨架。
- Modify: `src/pages/photo/[...slug].astro`
  负责单个图集详情页布局。
- Modify: `src/react/hooks/use-mobile.ts`
  负责 React 侧移动端判断，需要与 CSS 断点对齐。
- Modify: `src/react/components/MobileMenu/index.tsx`
  负责移动菜单触发器与菜单显隐。
- Modify: `src/react/components/Search/SearchButton.tsx`
  负责头部搜索入口在不同视口下的行为。
- Modify: `src/react/components/Search/Panel.tsx`
  负责搜索浮层尺寸与边距。
- Modify: `src/react/components/Search/Result.tsx`
  负责搜索结果列表的窄屏布局。
- Modify: `src/react/components/Search/Footer.tsx`
  负责搜索面板底部信息区。
- Modify: `src/react/components/photo/GroupSection.tsx`
  负责图集分组布局与 JS 媒体查询判断。
- Modify: `src/react/components/photo/Meta.tsx`
  负责图集详情页元信息区布局。
- Modify: `src/react/components/photo/index.module.css`
  负责图集组件的局部响应式样式。
- Create: `tests/helpers/astro-dev-server.mjs`
  抽取 Astro dev server 启停逻辑，供多个响应式 smoke test 复用。
- Create: `tests/responsive-layout.test.mjs`
  新增多页面响应式 smoke test，验证关键页面 HTML 中的 mobile-first 类名和核心结构。
- Modify: `tests/dev-homepage.test.mjs`
  改为复用 dev server helper，保留主页 200 响应与无 `ReferenceError` 的最基本防线。

### Task 1: 建立响应式回归测试入口

**Files:**
- Create: `tests/helpers/astro-dev-server.mjs`
- Create: `tests/responsive-layout.test.mjs`
- Modify: `tests/dev-homepage.test.mjs`

- [ ] **Step 1: 写失败的响应式 smoke test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { withAstroDevServer, fetchPage } from './helpers/astro-dev-server.mjs';

test('homepage uses mobile-first shell classes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    assert.match(home, /hidden sm:flex/);
    assert.match(home, /block sm:hidden/);
    assert.match(home, /px-5 sm:px-10/);
  });
});
```

- [ ] **Step 2: 运行测试，确认它先失败**

Run: `node --test tests/responsive-layout.test.mjs`
Expected: FAIL，因为当前首页和头部仍包含旧断点语义，例如 `sm:hidden`、`hidden sm:block`、`px-10 sm:px-5`

- [ ] **Step 3: 写最小测试辅助代码**

```js
export async function withAstroDevServer(run) {
  // 复用已有 waitForReady + spawn 逻辑，统一提供 baseUrl
}

export async function fetchPage(baseUrl, pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  return await response.text();
}
```

- [ ] **Step 4: 让现有主页 smoke test 复用 helper**

Run: `node --test tests/dev-homepage.test.mjs`
Expected: 仍然 PASS，并且不再重复写 server 启停逻辑

- [ ] **Step 5: 提交测试基础设施**

```bash
git add tests/helpers/astro-dev-server.mjs tests/responsive-layout.test.mjs tests/dev-homepage.test.mjs
git commit -m "test: add responsive layout smoke harness"
```

### Task 2: 迁移公共骨架到 mobile-first

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/Container.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/react/components/MobileMenu/index.tsx`
- Modify: `src/react/components/Search/SearchButton.tsx`
- Modify: `src/react/hooks/use-mobile.ts`
- Test: `tests/responsive-layout.test.mjs`

- [ ] **Step 1: 为公共骨架补失败断言**

```js
test('header exposes desktop nav and mobile menu with v4 semantics', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    assert.match(home, /class="[^"]*hidden sm:flex[^"]*"/);
    assert.match(home, /class="[^"]*block sm:hidden[^"]*"/);
    assert.match(home, /class="[^"]*px-5 sm:px-10[^"]*"/);
  });
});
```

- [ ] **Step 2: 运行测试，确认它失败在当前旧语义上**

Run: `node --test tests/responsive-layout.test.mjs`
Expected: FAIL，断言未命中当前的旧 class 组合

- [ ] **Step 3: 写最小实现，先收口公共骨架**

```astro
<!-- src/components/Container.astro -->
<Component class={cn('mx-auto min-w-[360px] max-w-[1220px] px-5 sm:px-8 lg:px-10', Astro.props.class)}>
  <slot />
</Component>
```

```astro
<!-- src/components/Header.astro -->
<div class="hidden sm:flex ...">...</div>
<MobileMenu className="block sm:hidden" />
```

```tsx
// src/react/hooks/use-mobile.ts
const MOBILE_BREAKPOINT = 640;
```

- [ ] **Step 4: 跑自动测试并做多视口手动验收**

Run: `node --test tests/dev-homepage.test.mjs tests/responsive-layout.test.mjs`
Expected: PASS

Manual check with Playwright MCP:
- `/` at `390`
- `/` at `768`
- `/` at `1024`
- `/` at `1280`

Expected:
- 手机只显示移动菜单与紧凑搜索入口
- `sm` 起显示桌面导航
- Header / Footer / Container 不再出现断点语义翻转

- [ ] **Step 5: 提交公共骨架迁移**

```bash
git add src/styles/global.css src/components/Container.astro src/components/Header.astro src/components/Footer.astro src/react/components/MobileMenu/index.tsx src/react/components/Search/SearchButton.tsx src/react/hooks/use-mobile.ts tests/responsive-layout.test.mjs
git commit -m "refactor: migrate shared responsive shell to mobile-first"
```

### Task 3: 收口共享标题区与列表骨架

**Files:**
- Modify: `src/components/ListTitle.astro`
- Modify: `src/components/ArticleTitle.astro`
- Modify: `src/components/ProjectTitle.astro`
- Modify: `src/components/ArticlesPair.astro`
- Modify: `src/components/ArticleListItem.astro`
- Test: `tests/responsive-layout.test.mjs`

- [ ] **Step 1: 为首页精选文章和标题区补失败断言**

```js
test('homepage content sections use mobile-first article list layout', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    assert.match(home, /columns-1 sm:columns-2/);
    assert.match(home, /text-\[21px\] sm:text-2xl/);
  });
});
```

- [ ] **Step 2: 运行测试，确认它在旧 class 顺序上失败**

Run: `node --test tests/responsive-layout.test.mjs`
Expected: FAIL，因为当前页面仍保留 `columns-2 sm:columns-1` 和旧式标题/卡片断点组合

- [ ] **Step 3: 写最小实现，统一标题与文章卡片**

```astro
<!-- src/pages/index.astro -->
<div class="relative z-10 columns-1 gap-y-6 sm:columns-2 sm:gap-x-6">
```

```astro
<!-- src/components/ArticleListItem.astro -->
@media (max-width: 639px) => base styles
sm:max-md / md:max-lg => 仅保留必要区间
```

- [ ] **Step 4: 运行测试并手动验收首页列表**

Run: `node --test tests/dev-homepage.test.mjs tests/responsive-layout.test.mjs`
Expected: PASS

Manual check with Playwright MCP:
- `/` at `390`
- `/` at `768`
- `/` at `1280`

Expected:
- 首页精选文章手机单列、桌面双列
- 标题字号和卡片间距按 mobile-first 递进
- 卡片图片比例与线上接近，不出现过度压缩

- [ ] **Step 5: 提交共享标题区与文章卡片迁移**

```bash
git add src/components/ListTitle.astro src/components/ArticleTitle.astro src/components/ProjectTitle.astro src/components/ArticlesPair.astro src/components/ArticleListItem.astro src/pages/index.astro tests/responsive-layout.test.mjs
git commit -m "refactor: migrate shared titles and article cards to mobile-first"
```

### Task 4: 迁移首页与随笔列表页骨架

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/journals/index.astro`
- Test: `tests/responsive-layout.test.mjs`

- [ ] **Step 1: 为 `/journals` 增加失败断言**

```js
test('journals timeline renders mobile-first timeline spacing', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const html = await fetchPage(baseUrl, '/journals');
    assert.match(html, /pl-8 md:pl-24 lg:pl-40/);
    assert.match(html, /sm:hidden md:block/);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --test tests/responsive-layout.test.mjs`
Expected: FAIL，因为随笔时间线仍然依赖旧 `sm/md/lg` 区间语义

- [ ] **Step 3: 写最小实现，先恢复结构，再收口区间**

```astro
<!-- src/pages/journals/index.astro -->
.note {
  @apply py-8 pl-8 md:pl-24 lg:pl-40;
}
```

```astro
<!-- src/pages/index.astro -->
<div class="daisy-stats mt-12 sm:mt-24 ...">
```

- [ ] **Step 4: 跑自动测试并手动验收时间线**

Run: `node --test tests/dev-homepage.test.mjs tests/responsive-layout.test.mjs`
Expected: PASS

Manual check with Playwright MCP:
- `/journals` at `390`
- `/journals` at `768`
- `/journals` at `1280`

Expected:
- 时间线在手机上单列、日期与卡片不重叠
- 平板和桌面保留时间线结构
- 首页统计区在手机上不挤压

- [ ] **Step 5: 提交首页与随笔列表页迁移**

```bash
git add src/pages/index.astro src/pages/journals/index.astro tests/responsive-layout.test.mjs
git commit -m "refactor: migrate home and journals layouts"
```

### Task 5: 迁移关于页、照片页与图集入口

**Files:**
- Modify: `src/pages/about.astro`
- Modify: `src/pages/photos.astro`
- Modify: `src/react/components/photo/GroupSection.tsx`
- Modify: `src/react/components/photo/Meta.tsx`
- Modify: `src/react/components/photo/index.module.css`
- Test: `tests/responsive-layout.test.mjs`

- [ ] **Step 1: 为 `/about` 和 `/photos` 写失败断言**

```js
test('secondary pages keep mobile-first shell classes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const about = await fetchPage(baseUrl, '/about');
    const photos = await fetchPage(baseUrl, '/photos');
    assert.match(about, /sm:flex-col lg:flex-row|flex-col sm:flex-row/);
    assert.match(photos, /px-5 sm:px-8 lg:px-20/);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --test tests/responsive-layout.test.mjs`
Expected: FAIL，因为关于页和照片页仍保留旧式 `sm:` 作为移动覆盖

- [ ] **Step 3: 写最小实现，统一页面容器和图集断点**

```tsx
// src/react/components/photo/GroupSection.tsx
const isNarrow = useMedia('(max-width: 1023px)', false);
```

```astro
<!-- src/pages/photos.astro -->
<Container class="min-w-[360px] max-w-full px-5 sm:px-8 lg:px-20">
```

- [ ] **Step 4: 跑测试并手动验收二级页面**

Run: `node --test tests/dev-homepage.test.mjs tests/responsive-layout.test.mjs`
Expected: PASS

Manual check with Playwright MCP:
- `/about` at `390`, `768`, `1280`
- `/photos` at `390`, `768`, `1280`

Expected:
- 关于页头像卡片不重叠
- 照片页容器边距与网格稳定
- 图集元信息与图片区在平板/桌面不炸布局

- [ ] **Step 5: 提交二级页面迁移**

```bash
git add src/pages/about.astro src/pages/photos.astro src/react/components/photo/GroupSection.tsx src/react/components/photo/Meta.tsx src/react/components/photo/index.module.css tests/responsive-layout.test.mjs
git commit -m "refactor: migrate about and photo entry layouts"
```

### Task 6: 迁移正文排版系统

**Files:**
- Modify: `src/styles/article.module.css`
- Modify: `src/pages/[...slug].astro`
- Modify: `src/pages/[journal].astro`
- Modify: `src/pages/photo/[...slug].astro`
- Test: `tests/responsive-layout.test.mjs`

- [ ] **Step 1: 为正文页补失败 smoke test**

```js
test('detail routes render without legacy breakpoint regressions', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const article = await fetchPage(baseUrl, '/2025/books');
    const journal = await fetchPage(baseUrl, '/journal2023-06-07');
    assert.ok(!article.includes('<title>ReferenceError</title>'));
    assert.ok(!journal.includes('<title>ReferenceError</title>'));
    assert.match(article, /class="[^"]*ArticleBody[^"]*"/);
  });
});
```

- [ ] **Step 2: 运行测试，确认它先失败或至少无法覆盖旧断点问题**

Run: `node --test tests/responsive-layout.test.mjs`
Expected: FAIL，或缺少足够断言来支撑正文迁移；此时继续补充断言直到能证明旧布局尚未迁移

- [ ] **Step 3: 写最小实现，优先改排版基线**

```css
/* src/styles/article.module.css */
.ArticleBody {
  @apply px-5 py-14 sm:px-0 sm:py-[120px];
}

.ArticleBody h1 {
  @apply text-[32px] leading-[1.3] md:text-[38px] lg:text-[52px];
}
```

- [ ] **Step 4: 运行自动测试并用多视口手动验收正文**

Run: `node --test tests/dev-homepage.test.mjs tests/responsive-layout.test.mjs`
Expected: PASS

Manual check with Playwright MCP:
- `/2025/books` at `390`, `768`, `1280`
- `/journal2023-06-07` at `390`, `768`, `1280`
- `/photo/2020` at `390`, `768`, `1280`

Expected:
- 正文主栏宽度稳定
- 表格、代码块、全宽图片在手机上不溢出
- 标题字号与段落行高顺序为 mobile-first

- [ ] **Step 5: 提交正文排版迁移**

```bash
git add src/styles/article.module.css src/pages/[...slug].astro src/pages/[journal].astro src/pages/photo/[...slug].astro tests/responsive-layout.test.mjs
git commit -m "refactor: migrate article and detail typography"
```

### Task 7: 收尾搜索面板与残留响应式组件

**Files:**
- Modify: `src/react/components/Search/Panel.tsx`
- Modify: `src/react/components/Search/Result.tsx`
- Modify: `src/react/components/Search/Footer.tsx`
- Modify: `src/react/components/Search/Recent.tsx`
- Modify: `src/react/components/Search/Header.tsx`
- Modify: `src/react/components/photo/ImageGallery.tsx`
- Test: `tests/responsive-layout.test.mjs`

- [ ] **Step 1: 为搜索区补失败断言**

```js
test('search overlay keeps mobile-first spacing and visibility classes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    assert.match(home, /sm:hidden/);
    assert.match(home, /sm:px-\[2vw\]/);
  });
});
```

- [ ] **Step 2: 运行测试并根据收尾目标调整断言**

Run: `node --test tests/responsive-layout.test.mjs`
Expected: FAIL，直到断言覆盖到需要迁移的搜索组件 class 模式

- [ ] **Step 3: 写最小实现，清理残留旧语义**

```tsx
// 目标不是继续保留旧 mental model，而是统一整理为 base + sm + md + lg
className="px-[2vw] py-[5vh] sm:px-[5vw] lg:px-[10vw]"
```

- [ ] **Step 4: 跑全量测试并做最终 grep**

Run: `node --test tests/dev-homepage.test.mjs tests/responsive-layout.test.mjs`
Expected: PASS

Run: `rg -n "sm:hidden|sm:block|md:flex-col|lg:flex-col|@media \\(max-width: 639px\\)|@media \\(max-width: 767px\\)|@media \\(max-width: 1023px\\)" src/components src/pages src/react src/styles`
Expected:
- 只剩经过人工确认、短期允许的中间态
- 不再有明显依赖旧语义的核心骨架代码

- [ ] **Step 5: 提交收尾迁移**

```bash
git add src/react/components/Search/Panel.tsx src/react/components/Search/Result.tsx src/react/components/Search/Footer.tsx src/react/components/Search/Recent.tsx src/react/components/Search/Header.tsx src/react/components/photo/ImageGallery.tsx tests/responsive-layout.test.mjs
git commit -m "refactor: finish responsive migration cleanup"
```

### Task 8: 最终验收与文档同步

**Files:**
- Modify: `docs/superpowers/specs/2026-03-24-tailwind-v4-responsive-migration-design.md`
- Modify: `docs/superpowers/plans/2026-03-24-tailwind-v4-responsive-migration.md`

- [ ] **Step 1: 跑完整验证**

Run: `node --test tests/dev-homepage.test.mjs tests/responsive-layout.test.mjs`
Expected: PASS

- [ ] **Step 2: 用 Playwright MCP 做最终四档宽度验收**

Manual check:
- `/` at `390`, `768`, `1024`, `1280`
- `/journals` at `390`, `768`, `1280`
- `/2025/books` at `390`, `768`, `1280`
- `/about` at `390`, `768`, `1280`
- `/photos` at `390`, `768`, `1280`

Expected:
- 与线上现状相比无明显视觉退化
- 不再出现断点语义翻转
- JS 与 CSS 响应式行为一致

- [ ] **Step 3: 更新文档中的执行状态与残留清单**

```md
- 已完成的批次
- 仍保留的中间态区间类
- 后续可选优化项（如继续压缩裸 @media）
```

- [ ] **Step 4: 提交最终验收结果**

```bash
git add docs/superpowers/specs/2026-03-24-tailwind-v4-responsive-migration-design.md docs/superpowers/plans/2026-03-24-tailwind-v4-responsive-migration.md
git commit -m "docs: record responsive migration completion"
```
