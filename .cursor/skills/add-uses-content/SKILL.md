---
name: add-uses-content
description: >-
  Adds or updates an item on the /uses page (在用): category, card note,
  optional introduction article, card logo, and article hero. Use when the
  user adds something to 在用, asks for a skill or tool introduction, or
  asks for a logo or 头图. Find the official product site yourself. Do not
  wait for the user to supply it, and do not treat the GitHub repo or a
  local skill copy as that site.
---

# 添加在用内容

只加用户这次明确说的东西。不要按仓库依赖或「应该也喜欢」补条目。用户没要文章就不要写文章。没要改导航、页面标题或地址就不要改。

分类以 [src/data/uses/AGENTS.md](../../../src/data/uses/AGENTS.md) 为准。先读它，再改 [src/data/uses/index.ts](../../../src/data/uses/index.ts)。不要在 `src/pages/uses.astro` 里写死分类。

## 分类

1. 读当前 `USES_GROUPS`。已有同名条目就改那一条，不要再插一条。
2. 已有分组的 `title` 不用改写也装得下，就放进去。差一点点时，优先判断 `title` 还能不能准确概括。改完标题之后什么都能往里放，就新建分组，放在数组末尾。新组必须带上这一条。
3. 组名用种类，不用这一条的品牌。不要用「其他」「杂项」「未分类」。技术栈、库、Skill、工具都不是预留组。大分类不要写 `description`。
4. 子分类只有一层。已有子分类装得下就放进去，不要再开近义子分类。看不出种类就留在父分类的 `items`。
5. `id` 用英文短横线，创建后不改。子分类 id 是 `{父分类 id}-{种类}`。页面上所有分组和子分类的 id 不能重复。顺序保持追加，不要重排。
6. 改子分类时不要顺手改父分类标题。已有父分类 `Skill`（id `skills`）保持不动，除非用户在说这个名字。

每条都要有 `note`。一两句，先说它是什么，再说具体做什么。用户说过理由就用用户的话；没说就按它实际是什么写。不要写成「因为很好用」。`href`：用户给了链接就用；没给时，只有官方地址明确才补。有介绍文章时，`href` 用站内路径，例如 `/2026/trellis`。

## 先找到官网

写 `note`、文章、logo、头图之前，先找到这个东西自己的官网。不要等用户把网址发过来。仓库 README、npm 页、skill 市场和本机已安装的 skill 都不是官网。

官网是产品自己的站点。从仓库的 homepage、README 里指向产品的链接，以及检索里对得上的域名确认。页面要和仓库互相指认：官网链到这个仓库，或仓库的 homepage 就是这个域名。同名站、评测、翻译镜像，对不上就不用。

找到之后，文章、`note`、logo、头图都以官网为准，不要只改其中一样。仓库 README 和本机 skill 里的数字、步骤、入口，与官网不一致就丢掉。不要写赞助、付费档、社区口号这类推广。

用户已经给了网址，就用用户的。那是在纠正找错的结果。

`note` 译官网上它自己的定义。一两句，先说它是什么，再说具体做什么。不要另写官网没说的口号。

Logo 用官网上的图标、favicon 或导航标志。有这个就换掉 GitHub 图标加名称。头图用官网的 `og:image` 或 share 图，换掉生成的封面。官方横图上的文字不用改成中文标题。用了别人的图，`heroCopyright` 链到官网。

换图都用新文件名，并改 import 或 frontmatter 的 `hero`。同一路径覆盖，长开的 dev server 仍会显示旧图。

## 介绍文章

用户要求介绍时才写。文件放在 `src/content/blog/YYYY/{slug}.md`。`src/content/blog` 里不以 `_` 开头的 markdown 都会进文集，缺 frontmatter 会构建失败。提示词、素材说明必须命名为 `_*.md`。

不要改文件名或 URL，除非用户要求。不要设 `featured`，除非用户要求。

### 标题

不要用「介绍 xxx」。用名字加一句它是什么，这句话必须来自正文开头已经写明的定义，不要另起口号。读者应能直接看懂，不必先懂文内术语。标题里不用的说法，正文里也不要拿来下定义。

可用的标题：

- `Trellis：给 coding agent 的脚手架`
- `Superpowers：一套软件开发方法`
- `Grill Me：把想法问清楚`

### 正文

书面中文，不要口语。用户没有要求按文风改写时，不要套 zh-style。不要写本文是参考或抄来的。不要写本仓库是怎么用它的。官方链接只放在最后一节。不要加许可证或入口节，除非用户要求。

小节标题固定为这四个，不要改成判断句或口号：

```markdown
## 什么是 {名字}

## 设计理念

## 基本用法

## 仓库与文档
```

`什么是` 先写它不是什么，再写它是什么。`仓库与文档` 只放用户给过或官方地址明确的链接。

Frontmatter 至少包括 `title`、`tags`、`category`、`hero`、`date`。技术向介绍用 `category: 技术`，并加 `type: post`。`hero` 写文章目录下的相对路径，例如 `./trellis.png`。别人的 logo 当头图时，用 `heroCopyright` 注明来源并链到出处。

## Logo 和头图

卡片 logo 放 `src/assets/image/`。在 `index.ts` 里用相对路径导入，不要用 `@assets`：

```ts
import trellisLogo from '../../assets/image/trellis.png';
// logo: trellisLogo.src
```

头图放在文章同一目录，和卡片 logo 是两个文件。只换其中一个时，不要顺手换另一个。

按这个顺序决定用哪张图：

1. 官网上的图标、favicon 或导航标志。有这个就不要再画 GitHub 图标加名称。像素图才设 `pixelated: true`。
2. 用户给了参考图，就用那些像素，不要重绘。方图当卡片 logo，横图当头图。
3. 都没有时，画它所在处的图标加上名称，例如 GitHub 图标加名称。不要画与它无关的抽象符号，也不要用纯黑字标。

深色单色标才设 `invert: true`。自带底色的彩色图不要反色。

卡片上的 logo 已经是 `h-auto max-h-11 w-auto max-w-[46%] object-contain`。不要改回固定高度，宽图会被压扁。

头图先用官网的 `og:image` 或 share 图。没有官方横图时，才用已安装的 baoyu-cover-image 生成。项目偏好在 `.baoyu-skills/baoyu-cover-image/EXTEND.md`（16:9、只放标题、无水印）。生成图上的标题必须与文章 `title` 逐字相同。生成结果若是 JPEG 数据，转成真正的 PNG 再放入文章目录。标题改了而图上印着旧标题时，重新生成头图。官方横图不要为了改标题而重绘。

`getImage` 按路径缓存。替换头图时换文件名，并改 frontmatter 的 `hero`。同一路径覆盖文件，长开的 dev server 仍会显示旧图。

## 做完核对

打开 `/uses` 和文章页。分类出现在该出现的组里；每条都有说明，名字下面能看到；logo 宽高比没被压扁；深色模式下只有深色单色标被反色；头图是新文件，HTML 里的 `origWidth` 与文件一致。确认依据是官网，不是仓库 README 或本机 skill。官网有标志和横图时，卡片不是 GitHub 锁图，文章也不是生成封面。
