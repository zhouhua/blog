# Tailwind v4 响应式迁移设计

**日期：** 2026-03-24

**背景**

当前仓库已升级到 Tailwind CSS v4，并在 [src/styles/global.css](/Users/zhouhua/Documents/GitHub/blog/src/styles/global.css) 中使用标准的 `--breakpoint-*` 断点定义。旧版本则依赖自定义 `screens`，其 `sm/md/lg/xl/2xl` 语义并不是 Tailwind 默认的 mobile-first `min-width`，而是按窄屏覆盖和区间断点来组织页面。升级后，大量组件仍沿用旧语义书写，导致首页、文章列表、随笔列表、正文详情页、搜索交互区和照片页等区域出现明显布局退化。

线上基准站点为 [https://www.zhouhua.site/](https://www.zhouhua.site/)。本次迁移以线上当前视觉行为为比对基准，在不明显退化的前提下，将仓库统一迁移到 Tailwind v4 标准响应式语义。

## 目标

1. 全面迁移到 Tailwind v4 标准 `min-width` 断点语义。
2. 不保留旧 `screens` 的兼容层，不重新定义 `sm/md/lg/xl/2xl` 来模拟旧行为。
3. 将关键页面恢复到接近线上现状的视觉表现，并统一为 mobile-first 写法。
4. 逐步减少裸 `@media` 和历史区间断点写法，优先清理高频公共骨架和正文排版系统。
5. 保证 CSS 断点与 JS 响应式判断一致。

## 非目标

1. 不进行新的视觉改版。
2. 不在本次迁移中引入新的主题体系或重写设计语言。
3. 不把所有历史样式一次性重构成全新组件库。
4. 不通过恢复旧 Tailwind 配置来“短期修复”问题。

## 现状与根因

旧版本 `tailwind.config.mjs` 中的断点语义为：

- `sm`: `<= 640px`
- `md`: `640px - 768px`
- `lg`: `769px - 1024px`
- `xl`: `1025px - 1280px`
- `2xl`: `1281px - 1536px`

当前 Tailwind v4 语义为：

- `base`: `< 640px`
- `sm`: `>= 640px`
- `md`: `>= 768px`
- `lg`: `>= 1024px`
- `xl`: `>= 1280px`
- `2xl`: `>= 1536px`

因此，旧代码中的以下模式在升级后会整体翻转：

- 把 `sm:` 当成“移动端覆盖”使用
- 把 `md:`、`lg:`、`xl:` 当成区间断点使用
- 在同一组件里混用 Tailwind 断点和裸 `@media (max-width: ...)`
- JS 使用独立的 `matchMedia` 宽度判断，但未与 CSS 同步

已确认的高影响文件包括：

- [src/styles/article.module.css](/Users/zhouhua/Documents/GitHub/blog/src/styles/article.module.css)
- [src/pages/journals/index.astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/journals/index.astro)
- [src/components/ArticleListItem.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/ArticleListItem.astro)
- [src/pages/index.astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/index.astro)
- [src/components/Header.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/Header.astro)
- [src/react/components/Search/SearchButton.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/Search/SearchButton.tsx)
- [src/react/hooks/use-mobile.ts](/Users/zhouhua/Documents/GitHub/blog/src/react/hooks/use-mobile.ts)

## 迁移原则

### 1. 统一为 mobile-first

所有响应式样式都以移动端为默认基线：

- `base` 表示移动端默认样式
- `sm`、`md`、`lg`、`xl`、`2xl` 只做向上增强

### 2. 允许过渡期使用显式区间

为了在迁移中先恢复行为，再收敛语义，允许短期使用 Tailwind v4 的显式区间写法：

- `sm:max-md:*`
- `md:max-lg:*`
- `lg:max-xl:*`
- `xl:max-2xl:*`

这些写法只作为中间态，不作为长期规范。

### 3. 先保行为，再收口代码

迁移采用两阶段策略：

1. 先把旧断点语义翻译成 v4 下的等价表达，恢复页面行为。
2. 再将高频组件和正文排版整理成真正的 mobile-first 递进结构。

## 断点映射规则

### 机械映射规则

用于第一阶段的统一映射：

- 旧 `sm:*`:
  - 优先转成 `base` 默认值
  - 常见形式如 `px-10 sm:px-5` 改为 `px-5 sm:px-10`
- 旧 `md:*`:
  - 转成 `sm:max-md:*`
- 旧 `lg:*`:
  - 转成 `md:max-lg:*`
- 旧 `xl:*`:
  - 转成 `lg:max-xl:*`
- 旧 `2xl:*`:
  - 转成 `xl:max-2xl:*`

### 常见显隐模式

- 旧 `sm:hidden`:
  - 视具体语义改为 `hidden sm:block`、`hidden sm:flex` 等
- 旧 `sm:block`:
  - 视具体语义改为 `block sm:hidden`

### 需要人工改写的模式

以下模式不能只做字符串替换，必须人工审阅和重写：

1. 显隐切换和双组件切换
2. `flex` / `grid` / `columns` / `absolute` / `sticky` / `order` 等布局模式切换
3. Tailwind 断点与裸 `@media` 混用
4. 已经存在逻辑错误的媒体查询
5. JS 中的响应式判断

## 分批迁移顺序

### 第一批：公共骨架

目标是先稳定容器、导航、标题区和全局边距，减少后续页面返工。

涉及文件：

- [src/components/Container.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/Container.astro)
- [src/components/Header.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/Header.astro)
- [src/components/Footer.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/Footer.astro)
- [src/components/ArticleTitle.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/ArticleTitle.astro)
- [src/components/ProjectTitle.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/ProjectTitle.astro)
- [src/components/ListTitle.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/ListTitle.astro)
- [src/styles/global.css](/Users/zhouhua/Documents/GitHub/blog/src/styles/global.css)

### 第二批：核心入口页面

目标是在关键页面恢复稳定布局，覆盖首页、列表页与个人页。

涉及文件：

- [src/pages/index.astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/index.astro)
- [src/pages/journals/index.astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/journals/index.astro)
- [src/pages/about.astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/about.astro)
- [src/pages/photos.astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/photos.astro)
- [src/components/ArticleListItem.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/ArticleListItem.astro)
- [src/components/ArticlesPair.astro](/Users/zhouhua/Documents/GitHub/blog/src/components/ArticlesPair.astro)

### 第三批：正文与详情页排版系统

目标是把断点最密集的正文区真正收口成 mobile-first。

涉及文件：

- [src/styles/article.module.css](/Users/zhouhua/Documents/GitHub/blog/src/styles/article.module.css)
- [src/pages/[...slug].astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/[...slug].astro)
- [src/pages/[journal].astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/[journal].astro)
- [src/pages/photo/[...slug].astro](/Users/zhouhua/Documents/GitHub/blog/src/pages/photo/[...slug].astro)

### 第四批：交互区与边角页面

目标是收尾 React 交互组件和剩余次高频页面，避免残留旧语义。

涉及文件：

- [src/react/components/Search/SearchButton.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/Search/SearchButton.tsx)
- [src/react/components/Search/Panel.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/Search/Panel.tsx)
- [src/react/components/Search/Result.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/Search/Result.tsx)
- [src/react/components/Search/Footer.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/Search/Footer.tsx)
- [src/react/components/MobileMenu/index.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/MobileMenu/index.tsx)
- [src/react/hooks/use-mobile.ts](/Users/zhouhua/Documents/GitHub/blog/src/react/hooks/use-mobile.ts)
- [src/react/components/photo/GroupSection.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/photo/GroupSection.tsx)
- [src/react/components/photo/Meta.tsx](/Users/zhouhua/Documents/GitHub/blog/src/react/components/photo/Meta.tsx)
- [src/react/components/photo/index.module.css](/Users/zhouhua/Documents/GitHub/blog/src/react/components/photo/index.module.css)

## 验证策略

### 验证宽度

所有批次都固定在以下宽度比对线上与本地结果：

- `390px`
- `768px`
- `1024px`
- `1280px`

### 验证原则

1. 先与线上现状对比，不先以理想布局为目标。
2. 在不明显退化的前提下，逐步收口成标准 mobile-first。
3. CSS 与 JS 的响应式行为必须一致。

### 各类页面的验收重点

首页与列表页：

- 导航显隐正确
- 卡片列数和间距合理
- 标题区、简介区、统计区不出现错位
- 图片卡片比例自然

正文与详情页：

- 正文主栏宽度稳定
- 标题和排版阶梯自然
- 图片、代码块、表格在手机上不破坏布局
- 引用、列表、脚注在小屏下可读

照片与交互页：

- 容器边距和网格稳定
- 搜索与抽屉类交互在各断点下行为正常
- JS 宽度判断与 CSS 断点保持一致

## 风险与控制

主要风险：

1. 为了“快速恢复”而重新定义 v4 断点语义，形成长期兼容债务。
2. 同一组件中长期混用旧语义和新语义。
3. 只修改 CSS class，不同步修正 JS 中的移动端判断。
4. 在迁移中顺手引入新的视觉设计，导致对比基准失真。

控制策略：

1. 不恢复旧 `screens` 配置。
2. 每一批完成后立即对照线上站点做多宽度验证。
3. 高风险组件先重写为 mobile-first，再推进依赖它们的页面。
4. 在最后一轮用全局搜索检查遗留旧语义模式与异常 `@media`。

## 实施结论

本次迁移选择的最终方案为：

- **方向：** 全面迁移到 Tailwind v4 标准 `min-width` 语义
- **方式：** 先做旧语义到新语义的明确映射，再逐步收口成 mobile-first
- **顺序：** 公共骨架 -> 核心页面 -> 正文排版系统 -> 交互与边角页
- **验收：** 以线上站点为视觉基准，在 `390 / 768 / 1024 / 1280` 四档宽度逐批验证

这份设计文档确认后，下一步将进入实现计划编写，并按批次开始执行迁移。
