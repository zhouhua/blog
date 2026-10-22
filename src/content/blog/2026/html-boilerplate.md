---
title: 我的 HTML 样板（译文）
tags:
  - HTML
  - 前端
  - Web
category: 技术
hero: ./html-boilerplate-hero.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@florianolv?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Florian Olivo</a> on <a href="https://unsplash.com/photos/4hbJ-eymZ1o?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-10-21 14:55:00
description: 译自 Vale：一份带主张的 HTML 样板，逐项说明 head/body 标签为何这样写。
---

> 本文译自 [My HTML Boilerplate](https://vale.rocks/posts/html-boilerplate)，作者 [Declan Chidlow（Vale）](https://vale.rocks/)。

HTML 刚出现时，一份文档可以非常简单。一份合法文档可以长这样：

```html
<TITLE>HTML document</TITLE>
<H1>Heading</H1>

<P>This is a paragraph with a <A HREF="https://example.com/">link</A>.
```

直到 HTML 2.0——第一个正式标准——才形成像样的文档结构。`DOCTYPE` 用来声明文档类型、处理兼容性；`head` 与 `body` 分区也成了预期写法：

```html
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">

<HEAD>
    <TITLE>HTML document</TITLE>
</HEAD>

<BODY>
    <H1>Heading</H1>
    <P>This is a document.
</BODY>
```

自 1995 年 HTML 2.0 问世以来，Web 变了很多。不过 Web 标准圈子里有句老话：**Don’t Break The Web（别弄坏 Web）**。例外总有，但大体上，Web 诞生之初写的站点，不论过了多久，在现代浏览器里仍应能工作。可是，要保住这种兼容性，又会因为唯恐弄坏现有站点，而让改动本身变得几乎不可能。

Web 应对这件事的办法之一，是在 HTML 文档里约定若干预期会出现的元素：有它，就启用新能力；没有，就退回旧行为。再叠加 Web 上各种集成与系统各自期待的字段，就意味着有相当多 **boilerplate（样板代码）**——几乎每个新站或维护中的站都会反复出现的那套代码。HTML 样板通常既选择加入现代能力，也写入站点偏好与细节：站点在社交媒体上如何嵌入、加载哪些样式、浏览器如何给站点周围的界面套主题，诸如此类。

## 样板

和[我维护的 CSS reset](https://vale.rocks/posts/css-reset) 一样——给样式一块干净底板——我也维护一份自己的样板，当作创建 HTML 文档时的基础结构和对照。和那份 CSS reset 一样，它**很有主张（opinionated）**。全文如下：

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width">
		<meta name="text-scale" content="scale">
		<title>Name of Page | Name of Website</title>

		<link rel="stylesheet" href="/styles.css">

		<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

		<meta property="og:title" content="Name of Page">
		<meta name="description" content="Description of this page.">
		<meta property="og:description" content="Description of this page for embeds.">

		<link rel="icon" type="image/svg+xml" href="https://example.com/favicon.svg">

		<meta property="og:image" content="https://example.com/embed-image.webp">
		<meta property="og:image:alt" content="A picture of something.">
		<meta property="og:image:type" content="image/webp">
		<meta property="og:image:width" content="1200">
		<meta property="og:image:height" content="630">

		<link rel="canonical" href="https://example.com/page">
		<meta property="og:url" content="https://example.com/page">

		<meta property="og:site_name" content="Website Name">

		<meta name="author" content="A N Other">

		<meta name="color-scheme" content="light dark">
		<meta name="theme-color" content="red" media="(prefers-color-scheme: light)">
		<meta name="theme-color" content="green" media="(prefers-color-scheme: dark)">

		<link rel="alternate" type="application/rss+xml" title="RSS feed of posts on Website Name." href="/posts/feed.xml">
		<link rel="alternate" type="application/feed+json" title="JSON feed of posts on Website Name." href="/posts/feed.json">

		<link rel="search" type="application/opensearchdescription+xml" title="Website Search" href="https://example.com/opensearch.xml">
		<link rel="manifest" href="/app.webmanifest">
	</head>

	<body>
		<header><nav></nav></header>
		<main id="main"></main>
		<footer id="footer"></footer>
	</body>
</html>
```

## 拆解

需要说明的是，我这份 HTML 样板是有顺序的。尤其是文档 `head` 里元素的次序，对性能影响很大。[Capo.js](https://rviscomi.github.io/capo.js/) 是从性能角度评估文档 `head` 元素顺序的出色工具。

```html
<!doctype html>
```

这是现行 HTML（Living Standard）的文档类型声明，HTML 5 引入。我总会写上它，避免掉进 **quirks mode（怪异模式）**。

```html
<html lang="en"></html>
```

打开包裹整份文档的 `html` 标签，并用符合 [RFC 5646](https://www.rfc-editor.org/info/rfc5646/) 的标签，通过 `lang` 属性标明文档语言。这里给出的是整页默认语言，可按元素覆盖。标明语言对自动翻译、连字符一类排版，以及对辅助技术（尤其是读屏）都很重要。

```html
<meta charset="UTF-8">
```

我放进 `head` 的第一个元素永远是值为 `UTF-8` 的 `charset` meta——HTML 5 起这是唯一合法编码。它必须出现在文档前 1024 字节内，所以总放在最前；也要放在任何可能被错误解码搞乱的内容之前。

```html
<meta name="viewport" content="width=device-width">
```

2007 年第一代 iPhone 上线时，会按桌面站去渲染，指望用户自己缩放、拖拽。Apple 为此引入了上面的 `meta`，给真正为移动端优化过的站点用；后来被各浏览器广泛采纳，成了让站点响应式的标配。

很多人会再写 `initial-scale=1`。我做过大量[测试和研究](https://vale.rocks/micros/20260902-1350)后认为，如今不必再写。若有元素横向撑出视口，它能改变呈现——但那种情况本就不该发生，[我也不建议靠它兜底](https://vale.rocks/micros/20260908-1315)。

`minimum-scale`、`maximum-scale` 和 `user-scalable` 会严重损害无障碍，**几乎永远不该用**。极端罕见情况下可以用，真遇到你会知道——务必极其谨慎。在站点里看到就该去掉。

```html
<meta name="text-scale" content="scale">
```

让文字[按系统设置缩放](https://matuzo.at/blog/2026/text-scaling-meta-tag)。有这个标签时，页面样式必须按「会缩放」来写——尤其要避开内容缩放相关的无障碍坑。

```html
<title>Name of Page | Name of Website</title>
```

页面的标题。这是必填值，会在许多界面上出现：收藏时的名称、搜索引擎里的标签名，以及任何需要页面名称的地方。我一般写成页面标题在前、站点标题在后。

```html
<link rel="stylesheet" href="/styles.css">
```

需要引入的样式都可以在这里引入。样式一般应在页面 `head` 里引入，而不是在样式表里用 `@import`——以免形成瀑布：必须先拉完这份样式表，才能再去拉后续样式表。

```html
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```

复杂可变字体即便做过子集化（subsetting）等优化，体积仍可能不小，所以我会对确定会用到的字体做 preload。即便字体在同源，`crossorigin` [属性仍然必要](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload#cors-enabled_fetches)。字体我一律以 WOFF 2 提供：它是广泛支持的格式里性能最好的。

```html
<meta property="og:title" content="Name of Page">
```

`og:title` 用于嵌入预览（如社交媒体），是 [Open Graph 协议](https://ogp.me)里的元数据之一。`<title>` 里我常在末尾带站点名，但 `og:title` 里不带——多数嵌入会在标题旁再显示域名或 `og:site_name`，写上就重复了。

```html
<meta name="description" content="Description of this page.">
```

我主要把这个 description 当 SEO 练习。以前大搜索引擎会在结果页直接展示它；如今多数会从文档正文里自己摘。

```html
<meta property="og:description" content="Description of this page for embeds.">
```

`og:description` 有时会出现在嵌入里。缺省时，嵌入要么不要描述，要么退回 meta description。我喜欢写短一点、带点俏皮、能在社交或聊天流里勾人兴趣的句子。

```html
<link rel="icon" type="image/svg+xml" href="https://example.com/favicon.svg">
```

favicon 是站点品牌的重要一环——尤其是标签页开很多时，靠它辨认。我用 SVG：[支持好](https://caniuse.com/link-icon-svg)、可随亮/暗色动态适配、各尺寸都清晰，也不必再维护一套多尺寸位图。

```html
<meta property="og:image" content="https://example.com/embed-image.webp">
<meta property="og:image:alt" content="A picture of something.">
<meta property="og:image:type" content="image/webp">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

`og:image` 定义的图常出现在社交或聊天的嵌入里。几乎每个站都值得写：多一层上下文，也常让嵌入卡片更大、更显眼。嵌入图的 alt 支持参差，不能全靠它；有的站认、有的忽略、有的行为怪异。我仍会写，但写短。1200×630 是广泛接受的尺寸；在我测过的现代格式里，WebP 兼容性最好。

```html
<link rel="canonical" href="https://example.com/page">
<meta property="og:url" content="https://example.com/page">
```

canonical 指向页面的权威版本，标明「以哪份为准」。内容有重复时尤其重要。

```html
<meta property="og:site_name" content="Website Name">
```

嵌入里展示的站点名。如前所述，有的嵌入会把它放在页面标题附近。

```html
<meta name="author" content="A N Other">
```

`author` 标明页面作者。并非硬性要求，但对开发者辨认责任人有用。

```html
<meta name="color-scheme" content="light dark">
```

把 `color-scheme` meta 的 content 设为 `light dark`，告诉浏览器本站同时支持亮色与暗色。把它写在 `head` 里，可以避免 **FOUC（Flash of Unstyled Content，无样式内容闪烁）**——例如站点和浏览器都设为暗色时，先闪出一整屏刺眼白底。

```html
<meta name="theme-color" content="red" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="green" media="(prefers-color-scheme: dark)">
```

用于已安装为 **PWA（渐进式 Web 应用）** 时主题化浏览器界面（browser chrome），以及 Android 版 Chrome 的浏览器界面主题（目前仅亮色模式）。其他浏览器也会以各自方式解读这些值。我用 `media` 分别为亮色、暗色设色。

```html
<link rel="alternate" type="application/rss+xml" title="RSS feed of posts on Website Name." href="/posts/feed.xml">
<link rel="alternate" type="application/feed+json" title="JSON feed of posts on Website Name." href="/posts/feed.json">
```

站点若有订阅源，写在 `head` 里便于[自动发现](https://piccalil.li/blog/a-quick-guide-to-creating-syndication-feeds/#auto-discovery)。

```html
<link rel="search" type="application/opensearchdescription+xml" title="Website Search" href="https://example.com/opensearch.xml">
```

站点若有站内搜索，准备好 [`opensearch.xml`](https://github.com/dewitt/opensearch/blob/master/opensearch-1-1-draft-6.md) 并在文档 `head` 里引用，浏览器就能提供更丰富的搜索体验。具体因浏览器而异，但很多情况下可从地址栏直接搜本站，也便于把本站加为搜索引擎。

```html
<link rel="manifest" href="/app.webmanifest">
```

我是渐进式 Web 应用的布道者。我喜欢它们；很多站点即便不是典型「应用」，做成 PWA 也有收益。即便唯一的好处只是「有人把站点加到主屏幕时呈现更好看」，我也会为多数站点[定义一份 manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)。这行声明帮浏览器发现这份 manifest。

```html
<header><nav></nav></header>
<main id="main"></main>
<footer id="footer"></footer>
```

这定义了任意站点通用的 body 结构。`header` 里放导航元素，做站点级导航。`main` 放页面主内容，并带 `id` 以提供锚点——这对「跳到正文」一类链接很重要。`footer` 放当前站点与页面的信息；和 `main` 一样，我也给它一个 `id` 方便锚定。body 样板我不会再写得更细，因为这随站点差异太大。

这只是样板。它是我在大约每个站都会纳入的内容模板，会有少量改动。每个站肯定会按自身需求偏离这份模板，但它是合理的地基。

若页面预期被学术引用，你会考虑加上 Google Scholar 的 `citation_*` meta，以及 [Dublin Core](https://www.dublincore.org/specifications/dublin-core/) 的 `dc` meta。若页面代表一篇文章，你会加上 Open Graph 协议 [article 命名空间](https://ogp.me/#type_article)里的标签，或许还有发布系统相关标签。视频、音频、书籍或其他内容类型，标记方式也会不同。许多站点还会受益于 [JSON-LD 结构化数据](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)。一切取决于具体页面需要什么。

