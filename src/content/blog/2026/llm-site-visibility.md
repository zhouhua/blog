---
title: 让网站被 LLM 和 Agent 看见
description: 聊天助手读的是 HTML。编程 Agent 会在 Accept 里要 Markdown。llms.txt 放在这些事情之后。
tags:
  - AI
  - LLM
  - Web
category: 技术
hero: ./llm-site-visibility-book.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@yanu?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Yannick Pulver</a> on <a href="https://unsplash.com/photos/open-book-on-brown-wooden-table-hopX_jpVtRM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-11-13 09:10:00
---

有人把一个 URL 贴进 ChatGPT，或者让 Cursor 去读一篇文档。抓取器拿到的常常不是正文，而是导航、脚本和一堆样板。

读者可以分成两类。编程 Agent 会在请求里写上 `Accept: text/markdown`，Claude Code、Cursor、OpenCode 属于这一类。聊天助手拿的是浏览器拿到的那份 HTML，ChatGPT 就是这样。前一类用内容协商，后一类靠干净的、在服务端渲染的 HTML。`llms.txt` 可以放，但放在这些事情之后。

[Google 的生成式 AI 功能指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)说得很直接：AI Overviews 和 AI Mode 用的是搜索自己的排名系统，没有一份必须额外提供的特殊文件。

## 先看 robots.txt

爬虫被挡在外面，后面的做法都到不了。很多默认配置会禁止 GPTBot、ClaudeBot。

要知道每条规则打中的是哪个机器人。OpenAI [写了三个 User-Agent](https://developers.openai.com/api/docs/bots)：

- `GPTBot` 为模型训练爬页面。
- `OAI-SearchBot` 为 ChatGPT 搜索建索引。
- `ChatGPT-User` 在对话中途、有人问起某个页面时去抓它。OpenAI 说，`robots.txt` 规则对它可能不适用。

所以禁止 `GPTBot`，离开的是训练数据，挡不住对话中途的抓取。CDN 上还有另一套开关。Cloudflare 可以在边缘挡住 AI 爬虫，这个开关和 `robots.txt` 是分开的。

顺手可以加一行 `Content-Signal:`。这是 [Cloudflare 提出、以 CC0 发布的约定](https://contentsignals.org/)，告诉爬虫：字节取走之后允许做什么。三个信号彼此独立。`search` 用于搜索结果，`ai-input` 用作回答的实时上下文，`ai-train` 用于训练或微调。

```text
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
```

取值按你自己的政策来。上面这行的意思是可以引用，不要拿去训练。Cloudflare 托管的 `robots.txt` 默认就是这个方向：允许搜索，不允许训练。这些是偏好，爬虫可以无视。

`Content-Signal:` 不属于 [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)。严格的 `robots.txt` 测试器会把它标成未知指令。这是警告，不是失败。同一份 RFC 要求爬虫忽略不认识的行，所以文件其余部分仍然有效。把这一行放进 `User-agent: *` 组，范围才是全部爬虫。

## 先做哪几件

| 机制 | 重要程度 | 工作量 |
| --- | --- | --- |
| 审计 `robots.txt`，加上 `Content-Signal:` | 关键 | 低 |
| 干净的、服务端渲染的 HTML | 关键 | 持续做 |
| `.md` 路由 | 关键 | 路由加内容 |
| `<link>` 加 HTTP `Link` 头 | 中 | 模板加中间件 |
| `Accept: text/markdown` 内容协商 | 关键 | 服务器逻辑 |
| `/llms.txt` | 低 | 静态文件，要挑选 |
| `/llms-full.txt` | 低 | 静态文件或重定向 |
| Schema.org / JSON-LD | 间接 | 低 |
| Agent Skill 和发现索引 | 有做法可以分享时才高 | 中 |
| 对 AI 端点做服务端统计 | 运维项 | 中 |

## 聊天助手读的是 HTML

聊天助手读的就是访客拿到的那份 HTML。内容要在服务端渲染。不执行打包脚本的抓取器，看到的就是响应里的东西。如果那是一个空的 `<div id="root">`，模型读到的就是它。

用真正的语义。一个 `<h1>`，标题层级按顺序。正文放进 `<main>` 或 `<article>`，导航和页脚放进各自的地标。链接用真正的 `<a href>`，不要把点击处理绑在 `<div>` 上。Agent 靠标题和链接决定下一步抓什么。它跟不了的按钮就是死路。

`<head>` 要轻。抓取器按预算读。Claude Code 的 WebFetch 会先把页面转成 Markdown，再读转换结果。转换丢掉标签和属性，所以 SVG 路径和 class 名不占额度，但 `<style>` 和 `<script>` 里面的文本会留下来。一大段内联样式排在第一个标题前面，正文就挤不进去。Agent 放弃沉重的页面之后，读到的是搜索摘要，或者别人对你的转述。

表格保持为表格，代码放在 `<pre><code>` 里。你自己不提供 Markdown 时，Claude Code 和 [Cloudflare 的转换器](https://blog.cloudflare.com/markdown-for-agents/) 也会把 HTML 转成 Markdown。

已有的结构化数据要和可见文本一致。JSON-LD 仍然有用的地方在后面。

不要在页面里藏一段只有 AI 能看见的提示。想要 Markdown 的客户端会用 `Accept` 来要，其余的只是读页面。

## `.md` 路由

清单上其他东西都是指针。这些指针指向的，就是每个页面的 Markdown。

[llmstxt.org](https://llmstxt.org/) 建议：有用的页面在同一 URL 后面加上 `.md`。`example.com/blog/my-post` 就有一个孪生地址 `example.com/blog/my-post.md`。站点根或索引页是 `/index.md`。

HTML 里大量是导航和脚本。Markdown 把这些拿掉，上下文里剩下的是正文。HTML 如果已经干净、有语义，这个差距会小很多。HtmlRAG 还指出另一面：标题、表格这类结构，剥成纯文本之后会丢。所以 `.md` 路由解决的是样板太重，不是「Markdown 天生更好」。

每个页面维护两份，内容会漂。HTML 更新了、Markdown 端点忘了，读到的就是旧信息。自动转换，或者从同一份来源提供。

```typescript
// /blog/:slug 的路由处理
export async function handleRequest(request: Request) {
  const url = new URL(request.url);
  const post = await getPost(url.pathname);

  // 同一路径加上 .md 后缀时提供 Markdown
  if (url.pathname.endsWith('.md')) {
    return new Response(post.markdownContent, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  return renderHTML(post);
}
```

[Vercel 的实现指南](https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation)讲了内容以富文本存在 CMS 里时，怎样在路由里即时转成 Markdown。内容本来就是 Markdown，可以直接提供源文件。

## 怎样告诉客户端有 Markdown

同一件事，用两种方式告诉两类客户端。

HTML 的 `<link>` 放在 `<head>` 里，处理 DOM 的爬虫能读到：

```html
<link
  rel="alternate"
  type="text/markdown"
  href="/blog/my-post.md"
/>
```

发现 RSS 和备用语言版本用的是同一机制。`rel="alternate"` 从 HTML4 起就在 [WHATWG 规范](https://html.spec.whatwg.org/multipage/links.html#link-type-alternate)里，`text/markdown` 自 [RFC 7763](https://datatracker.ietf.org/doc/html/rfc7763) 起是注册过的 MIME 类型。

HTTP `Link` 头语义相同，正文还没读就能看见。有些 Agent 不解析 HTML，只读响应头：

```text
Link: </blog/my-post.md>; rel="alternate"; type="text/markdown"
```

中间件里一行可以盖住所有页面：

```typescript
function addMarkdownLink(request: Request, response: Response) {
  const url = new URL(request.url);
  response.headers.set(
    'Link',
    `<${url.pathname}.md>; rel="alternate"; type="text/markdown"`
  );
  return response;
}
```

两个都放。标签接住读 DOM 的，头接住不读正文的。

## 内容协商

`Accept: text/markdown` 是用 HTTP 自己的方式提供 Markdown。它服务的是会写这个头的编程 Agent。聊天助手通常不写这个头，所以内容协商替不了干净的 HTML。

谁在发送这个头，会变。2026 年 2 月 [Checkly 测过一批编程 Agent](https://www.checklyhq.com/blog/state-of-ai-agent-content-negotation/)：Claude Code、Cursor、OpenCode 会要 Markdown；OpenAI Codex、GitHub Copilot、Gemini CLI、Windsurf 当时不会。Anthropic 的文档写明，Claude Code 的 WebFetch 会带上优先 Markdown 的 `Accept`。名单以你自己的请求日志为准，不要背一份过期的清单。

[内容协商](https://www.rfc-editor.org/rfc/rfc9110#section-12)从 HTTP/1.1 起就是 Web 的一部分。浏览器要 HTML、API 客户端对同一 URL 要 JSON，靠的就是它。扩展到 Markdown，客户端发送：

```text
Accept: text/markdown, text/html;q=0.9
```

服务器能给 Markdown 就给 Markdown，否则给 HTML。同一 URL，同一内容，不同表示。`Vary: Accept` 告诉 CDN 把它们分开缓存。

和 `Link` 头、`.md` 地址合在一起，一个处理函数覆盖三种：

```typescript
type AcceptEntry = { type: string; q: number };

function parseAccept(accept: string): AcceptEntry[] {
  if (!accept.trim()) return [{ type: '*/*', q: 1 }];
  return accept
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const [type, ...params] = item.split(';').map((s) => s.trim());
      let q = 1;
      for (const p of params) {
        const eq = p.indexOf('=');
        if (eq < 0 || p.slice(0, eq).trim().toLowerCase() !== 'q') continue;
        const n = parseFloat(p.slice(eq + 1));
        if (Number.isFinite(n)) q = n;
      }
      return { type: type.toLowerCase(), q };
    });
}

function qualityFor(entries: AcceptEntry[], candidate: string): number {
  const [primary] = candidate.split('/');
  let bestSpec = -1;
  let bestQ = 0;
  for (const { type, q } of entries) {
    const spec =
      type === candidate ? 3 :
      type === `${primary}/*` ? 2 :
      type === '*/*' ? 1 : -1;
    if (spec < 0) continue;
    if (spec > bestSpec || (spec === bestSpec && q > bestQ)) {
      bestSpec = spec;
      bestQ = q;
    }
  }
  return bestQ;
}

function hasExplicitType(entries: AcceptEntry[], candidate: string): boolean {
  return entries.some((e) => e.type === candidate && e.q > 0);
}

// markdownContent 和 htmlContent 在别处生成：渲染器、CMS 或静态构建
export async function handleRequest(request: Request) {
  const url = new URL(request.url);
  const isMdUrl = url.pathname.endsWith('.md');
  const htmlPath = isMdUrl ? url.pathname.replace(/\.md$/, '') : url.pathname;
  const mdLink = `<${htmlPath}.md>; rel="alternate"; type="text/markdown"`;
  const htmlLink = `<${htmlPath}>; rel="alternate"; type="text/html"`;

  if (isMdUrl) {
    return new Response(markdownContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept',
        'Link': htmlLink,
      },
    });
  }

  const accept = parseAccept(request.headers.get('accept') ?? '');
  const mdQ = qualityFor(accept, 'text/markdown');
  const htmlQ = qualityFor(accept, 'text/html');

  if (mdQ === 0 && htmlQ === 0) {
    return new Response('Not Acceptable', {
      status: 406,
      headers: {
        'Content-Type': 'text/plain',
        'Vary': 'Accept',
        'Link': `${htmlLink}, ${mdLink}`,
      },
    });
  }

  if (hasExplicitType(accept, 'text/markdown') && mdQ >= htmlQ) {
    return new Response(markdownContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept',
        'Link': htmlLink,
      },
    });
  }

  return new Response(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Vary': 'Accept',
      'Link': mdLink,
    },
  });
}
```

两件事要单独说。

两种格式都不要时，返回 [`406 Not Acceptable`](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.7)。默默换成另一种更糟。客户端要的是 `application/json`，你却给了 HTML，错配不会在边界被抓住，而是稍后某个解析器被一堵标签噎住。406 让客户端改要别的东西。

比较 [q 值](https://www.rfc-editor.org/rfc/rfc9110#section-12.4.2)，不要对 `Accept` 做子串匹配。`Accept: text/html, text/markdown;q=0.5` 的意思是 Markdown 可以收，真正要的是 HTML。看成「客户端要 Markdown」，浏览器会得到一坨原始 `.md`，把 HTML 放在前面的 Agent 会得到被剥掉的 Markdown。`qualityFor` 比较的是偏好分数，q 更高的格式胜出。

[acceptmarkdown.com](https://acceptmarkdown.com) 就查这几件事：会不会对 `Accept: text/markdown` 返回 Markdown，有没有 `Vary: Accept`，不支持的类型会不会返回 406，会不会尊重 q 值。

内容协商不要求客户端事先知道这个站点。任何发送正确头的 Agent，都能从符合规范的服务器拿到 Markdown。这是 HTTP 在做它被设计来做的事，不依赖一份新的文件格式。

Google 把给机器人提供不同内容标成[伪装](https://developers.google.com/search/docs/essentials/spam-policies#cloaking)。要分开的是：同一 URL、同一内容、不同格式，并用 `Vary: Accept` 声明。这和给机器人一整篇不同的文章不是一回事。`Accept: application/json` 对 `Accept: text/html` 一直就是这样工作的。

## `llms.txt` 放在后面

`llms.txt` 是放在站点根上的一份 Markdown，给 AI 一张你认为值得读的地图。格式在 [llmstxt.org](https://llmstxt.org/)。2024 年由 Answer.AI 的 Jeremy Howard [提出](https://www.answer.ai/posts/2024-09-03-llmstxt.html)。故意做得很小：一个写站点名的 H1，一段 blockquote 摘要，然后是带注释链接的 H2 小节。

```markdown
# My Project

> A tool for doing X. Built for developers who care about Y.

## Documentation

- [Quick Start](https://example.com/docs/start.md): Get up and running in 5 minutes
- [API Reference](https://example.com/docs/api.md): Full endpoint documentation

## Optional

- [Changelog](https://example.com/changelog.md): Recent updates
```

要挑选。sitemap 列出每个 URL，`llms.txt` 只列值得读的页面，按主题分组，每个链接一行说明。链接指向该页的 `.md` 版本。从页面和文档链到这个文件，否则 Agent 不知道它在哪。只保留普通链接和描述，不要写成指令。一份写给 LLM 的文件，同时也是提示注入的表面。

没有主要 LLM 提供商承诺会读这个文件。Google 的指南把它放进可以跳过的清单：不需要新建机器可读文件、AI 文本文件、标记或 Markdown，也能出现在 Google 搜索里，因为搜索本身不用它们。John Mueller 在 [Bluesky](https://bsky.app/profile/johnmu.com/post/3lrshm4gggs2v) 上说过，目前没有 AI 系统在使用 llms.txt。

工具倒是动过。[Lighthouse](https://github.com/GoogleChrome/lighthouse/releases/tag/v13.3.0) 会检查这个文件的格式，Chrome 的文档称它目前是可选的。所以搜索忽略它，Lighthouse 却检查它。

可以发出去。有人把 Agent 指到这个 URL 时，它可以当一份目录。不要把它当成被读到的前提。

## `/llms-full.txt`

这是同伴文件，并不属于 llmstxt.org 规范。`/llms.txt` 是精选索引，`/llms-full.txt` 是全文堆在一处，没有要跟随的链接。文档站可以把一套 API 说明放进一次抓取。博客或营销站，重定向到 `/index.md` 就够。整站倒进一个文件，多半是过度。

## Agent Skill

上面是让 Agent 读你的页面。如果你有一套可以重复的做法，还可以发一份给 Agent 安装的 `SKILL.md`，并在 `.well-known/agent-skills/index.json` 里列出来。`npx skills add` 会读这份索引。和 `llms.txt` 不同，这个固定路径有一个真正的消费者：没有索引，安装器就不知道有什么可装。怎样发布，见[像发布软件包一样发布 Agent Skills](/2026/agent-skills-discovery)。

## 这些做法可以不做

下面几种没有规范，也没有客户端靠它们来发现内容。

- `<meta name="ai-content-url">` 没有来源，没有提案。
- `<meta name="llms">` 作为 [WHATWG HTML issue #11548](https://github.com/whatwg/html/issues/11548) 提交过，结论是不计划做。
- `/.well-known/ai.txt` 和 `/ai.txt` 有好几份互相竞争的提案，都没有被采用。
- HTML 注释（`<!-- AI-READABLE-VERSION -->`）会被解析器剥掉。聊天助手读的是渲染后的文本，不是原始 HTML。
- 人 / AI 切换按钮。已经有 `.md` 路由和内容协商时，Agent 不会去点按钮。
- 用 User-Agent 嗅探来提供 Markdown。按访客是谁给不同内容，是伪装。符合标准的做法是客户端用 `Accept` 自己来要。
- 单独做一页「给 AI 助手」的公司事实。没有证据表明爬虫会把它和站点上其他结构清楚的页面区别对待。
- 页面里隐藏的「给 AI」提示。想要 Markdown 的 Agent 用 `Accept` 来要。

模式总是一样：有人发明一个新文件或 meta 标签，写一篇博客，别的博客再把那篇引成证据。没有人检查是否真有客户端在读它。

模型读的是看得见的正文。引语、出处如果要写，写在正文里，不要写进它不读的注释和 meta。

### JSON-LD

结构化数据不帮助模型读你的页面，但它喂搜索索引，很多回答是从索引来的。模型多半不从页面上读 JSON-LD。数据偶尔传过去，也是被当成纯文本读的。

Google 的 AI Overviews 和 AI Mode 根植于搜索系统。这些系统用标记做富结果，并要求标记[与页面上的可见文本一致](https://developers.google.com/search/docs/appearance/ai-features)。[Merchant Center](https://support.google.com/merchants/answer/6069143) 读 `schema.org/Product` 来保持价格和库存。Bing 把同样的标记和 [IndexNow](https://blogs.bing.com/webmaster/2025/5/IndexNow-Enables-Faster-and-More-Reliable-Updates-for-Shopping-and-Ads/) 配在一起。

商务 Agent 则跳过这套标记。OpenAI 的[商品 feed](https://developers.openai.com/commerce/specs/file-upload/products) 是 CSV、TSV 或 JSONL。[Universal Commerce Protocol](https://ucp.dev/) 跑在 REST 和 JSON-RPC 上。两者都没有用 Schema.org。

所以已有的 JSON-LD 留着，让它和可见页面一致。卖东西，就进入那些 feed。不要为了模型去加 schema，也不要因为模型看不见就拆掉。

## 怎样知道有没有用

不记日志就不知道。客户端统计帮不上，因为爬虫不执行 JavaScript。要的是能看到原始 User-Agent 的服务端日志。

给 Markdown 端点、`/llms.txt` 和 `/llms-full.txt` 记一笔：谁来抓的，从哪个 referrer 来的。这是在记录，没有改变你提供的内容。

```typescript
const url = new URL(request.url);
if (url.pathname.endsWith('.md')) {
  const ua = request.headers.get('user-agent') ?? '';
  const ref = request.headers.get('referer') ?? '';
  analytics.track('markdown_fetch', { ua, ref, path: url.pathname });
}
```

分类用排除法。不要依赖一份已知 AI User-Agent 清单，新的会不断出现。排除浏览器、搜索爬虫和扫描器，剩下的再看。再把每个提供商的爬虫和它的按需抓取器分开。训练爬虫和对话中途来抓页面的，不是同一个东西。

Google Search Console 有生成式 AI 效果报告，Bing 网站管理员工具有面向 Copilot 的 [AI Performance 报告](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)。两者都只覆盖基于搜索的回答引擎。编程 Agent 和按需抓取器不会出现在里面，所以服务端日志还是要。

## 接线对不对

[acceptmarkdown.com](https://acceptmarkdown.com) 查内容协商：这个 URL 对 `Accept: text/markdown` 会不会提供 Markdown，有没有 `Vary: Accept`，不支持的类型会不会返回 406，会不会尊重 q 值。它还给了 Nginx、Caddy、Cloudflare Workers、Next.js、Astro、Rails、Express、Django 的配方。

[isitagentready.com](https://isitagentready.com) 查得更宽：`robots.txt`、sitemap、`Link` 头、Markdown 协商，以及 Content Signals、[Web Bot Auth](https://datatracker.ietf.org/doc/draft-meunier-web-bot-auth-architecture/)、MCP、Agent Skill、[x402](https://www.x402.org/)。后一半关乎 Agent 能在站点上做什么，不关乎它能读到什么。

如果今天只做一件事：做内容协商，后面接上 `.md` 路由，然后把扫描器跑过。它们指出的问题常常是缺一个 `Vary`、状态码不对、没有 `Content-Signal:`。

## 上线顺序

不同的系统从不同路径进来。`ChatGPT-User` 读渲染后的 HTML。Claude Code 发送 `Accept: text/markdown`。`OAI-SearchBot` 会直接抓 `.md` URL。配置 Cursor 的人可能会贴上 `/llms-full.txt`。

1. 审计 `robots.txt`，加上 `Content-Signal:`。弄清 OpenAI 三个机器人各自受哪条规则影响。
2. 让 HTML 干净，并在服务端渲染。
3. 为每个页面提供 `.md` 路由。
4. 加上 `<link>` 和 HTTP `Link` 头。两种表示都要有。
5. 实现 `Accept: text/markdown` 内容协商，带 q 值、对不支持的类型返回 406，以及 `Vary: Accept`。
6. 做服务端日志。用排除法分类，把爬虫和按需抓取器分开。
7. 加上 `/llms.txt`，并从页面链向它。
8. 跑 acceptmarkdown.com 和 isitagentready.com。

目标是让内容能被读到。理由和写语义 HTML 一样。读者里现在有语言模型和 AI Agent。

## 问答

六种都要做，还是可以从一种开始？

从内容协商和干净的 HTML 开始。一类读者会要 Markdown，一类只读 HTML。内容协商需要后面的 `.md` 路由，其余可以以后再来。

会伤害 Google SEO 吗？

`rel="alternate"`、已注册的 MIME 类型、带 `Vary: Accept` 的内容协商，都是标准 HTTP。Google 的指南说的是搜索不用 `llms.txt` 或 Markdown 文件，不是说会处罚它们。

ChatGPT、Claude 和 Perplexity 会自动爬 `/llms.txt` 吗？

不要指望。没有提供商承诺会读这个文件。文件仍然可以发，但排在内容协商之后。

哪些编程 Agent 会发送 `Accept: text/markdown`？

以 2026 年 2 月的那次测试为起点：Claude Code、Cursor、OpenCode 会；OpenAI Codex、GitHub Copilot、Gemini CLI、Windsurf 当时不会。这份名单会变，看你自己的日志。

要不要加 JSON-LD，好让 LLM 理解页面？

不要为了这个理由。把它留给搜索索引和购物系统，并让它和可见文本一致。卖商品的话，进入商品 feed。

这和「为 AI Agent 优化」是一回事吗？

词汇还没定下来。对 Agent 友好、AI 可读、GEO，指的是同一件事：Agent 和聊天助手能够抓取并引用的站点。工作就是上面这些做法。

做法整理自 [Making your site visible to LLMs and AI agents](https://evilmartians.com/chronicles/how-to-make-your-website-visible-to-llms)。
