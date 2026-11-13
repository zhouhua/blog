---
title: 像发布软件包一样发布 Agent Skills
description: 在自己的域名上发布发现索引和安装文件，并为每份文件附上校验摘要，让任何 Agent 都能装上。
tags:
  - AI
  - skill
  - 发布
category: 技术
hero: ./agent-skills-discovery-parcel.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@brandablebox?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Brandable Box</a> on <a href="https://unsplash.com/photos/shallow-focus-photo-of-brown-cardboard-box-8mCsyImZRGY?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-11-12 18:00:00
---

Agent Skill 是一个指令目录，用来教编程 Agent 一套可重复的做法：把某件事做好的约定和检查打包进去，让任何 Agent 都能照着做。有人把做法写下来，别人的 Agent 再把它装上。下面讲怎么发布自己的 Skill，让任何 Agent 都能装到。

要让人找得到，在自己的域名上放一份 `.well-known/agent-skills/index.json`。每个 Skill 一条，写下 `name`、`description`、`type`、`url`，以及文件的 `sha256` 摘要。

`npx skills` 会读这份索引。Skill 写在 GitHub 仓库里，安装器和 Claude 的插件市场可以直接从仓库取。发出去的字节放在你自己的域名上，摘要就按这一份来算。形态分三种：单文件、多文件和套装，各有各的处理。安装命令多留几种，因为读者用的工具不一样。

这不是一套新机制。npm 和 RubyGems 一直就是这么做的，只是这次指向一个带着 `SKILL.md` 的目录。

这套步骤本身也可以做成一份 Skill。装上之后，Agent 可以按同样的流程把目录发出去，发现索引和摘要都算在内。

## 用一个 JSON 文件提供发现入口

安装器不用去猜你发布了哪些 Skill。在自己的域名上，按固定路径放一份目录：

```text
https://skills.example.com/.well-known/agent-skills/index.json
```

`npx skills` 是 Vercel Labs 开源的安装工具，通过 npm 上的 `skills` 包提供，背后连接 skills.sh 生态。除了 Git 仓库，它也能从带发现索引的域名安装 Skill：

```bash
npx skills add https://skills.example.com
```

安装器读取索引后，会列出这个域名下的 Skills，供用户选择。也可以直接指定名称，或者安装全部：

```bash
# 安装指定 Skill
npx skills add https://skills.example.com --skill readme-guide

# 安装目录中的全部 Skills
npx skills add https://skills.example.com --skill '*'
```

这里要保留完整的 `https://` URL。`owner/repo` 形式会被当作 Git 仓库来源，不能用省略协议的写法代替完整的 `https` 地址。尽量使用域名根地址。附带路径会限定索引查找范围，不应依赖安装器继续回退到根目录。

这种发现机制来自 Cloudflare 提出的开放 RFC，采用 `.well-known/` 固定路径约定，底层 Skill 格式则由 Anthropic 引入。发现格式并不专属于某一家安装器，其他客户端也可以读取索引、解析文件并完成安装。

下面是 discovery `0.2.0` 的结构。域名和名称是例子，`digest` 要换成那份文件真正的 SHA-256。

```json
{
    "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    "skills": [
        {
            "name": "readme-guide",
            "description": "编写或改进项目 README，整理安装步骤与使用示例。",
            "type": "skill-md",
            "url": "https://skills.example.com/artifacts/readme-guide/SKILL.md",
            "digest": "sha256:<实际文件的64位十六进制摘要>"
        }
    ]
}
```

每个 Skill 有五个字段：

| 字段 | 含义 |
| --- | --- |
| `name` | 安装器使用的名称 |
| `description` | 简短说明用途与适用场景 |
| `type` | `skill-md` 表示单文件，`archive` 表示归档 |
| `url` | 指向实际发布文件 |
| `digest` | 该文件的 SHA-256 摘要，格式为 `sha256:<hex>` |

安装器下载文件后重新计算摘要，与索引中的值比较。遵循该 RFC 的客户端必须执行验证，并拒绝使用校验不通过的内容。

这个索引不需要自行增加顶层 `version`、`origin`、`bundles`，也不需要给条目增加 `bundle` 字段。套装由各个成员的普通条目表示。自创一套结构，很容易得到一份人看得懂、安装器却不处理的 JSON。

## 三种打包形式，三种处理方式

索引中的 `type` 只有两个值，但实际发布时需要区分单文件、多文件和套装。

| 形式 | 索引表示 | 下载内容 | 安装方式 |
| --- | --- | --- | --- |
| 单文件 Skill | `type: skill-md` | `SKILL.md` | 复制到目标目录 |
| 多文件 Skill | `type: archive` | 根目录平铺的 `.tar.gz` | 解压到该 Skill 的目录 |
| 套装 | 每个成员分别建立条目 | 各成员自己的文件 | 分别安装，也可另提供组合归档 |

### 单文件：直接发布 Markdown

如果目录中只有 `SKILL.md`，索引的 `url` 就直接指向它。安装只涉及一个文件，也可以提供“复制完整 SKILL.md”，让人直接粘贴到正在使用的 Agent 里试用。

这是最简单的发布形式，不需要额外打包。

### 多文件：把附件一起装进去

如果 Skill 需要脚本、参考表或模板，只复制 `SKILL.md` 就会漏掉依赖。应当把整个 Skill 打包成 `<name>.tar.gz`，并使用 `type: archive`。

归档内的结构应该是：

```text
SKILL.md
scripts/check.py
references/style-guide.md
```

`SKILL.md` 位于归档根目录，不要再包一层以 Skill 名称命名的目录。安装器会把归档解压到目标 Skill 文件夹，多一层目录就可能让入口文件落在错误位置。

摘要针对整个 `.tar.gz` 文件计算，而不是只针对 Markdown。

归档与摘要最好在同一轮构建中生成。压缩包包含的不只是正文，文件顺序、权限和修改时间，以及 gzip 自身的时间戳都会影响最终字节。同一组源文件打包两次，也可能得到不同摘要。

如果归档和索引必须分开构建，就需要固定这些变量。例如，在 GNU tar 环境下，可以采用下面的方式控制排序、所有者和时间戳，并通过 `gzip -n` 去掉压缩头中的名称与时间戳信息：

```bash
tar --sort=name \
    --owner=0 --group=0 --numeric-owner \
    --mtime='UTC 2020-01-01' \
    -C ./skills/readme-guide -cf - . \
    | gzip -n > readme-guide.tar.gz
```

### 套装：一个仓库，多个独立 Skill

套装是多个 Skills 的集合，不是一个更大的 `SKILL.md`。

每个成员仍有自己的索引条目，因此用户可以用 `--skill <name>` 只安装其中一个。套装介绍页不需要假装存在一份对应的 `SKILL.md`，可以展示成员列表，并提供组合归档。

组合归档中的各个 Skill 应当并列放在独立目录中：

```text
readme-guide/SKILL.md
code-review/SKILL.md
test-design/SKILL.md
```

它可以一次解压到 Skills 的公共目录，让用户整套安装。单个多文件 Skill 的归档与套装归档，区别就在这一层目录结构。

## 在仓库里维护，在自己的域名上发布

源文件放在哪里，与安装文件从哪里下载，是两个不同的问题。

GitHub 仓库承担三项工作：

* 维护版本、审查变更，让 Skill 像代码一样持续改进。
* 为 `gh skill install` 提供直接读取的来源。
* 通过仓库中的 `.claude-plugin/marketplace.json` 支持 Claude 插件市场安装。

但发现索引中的 `url` 不必指向 GitHub raw 地址。将文件重新托管到自己的域名，有几个实际好处。

首先，多文件 Skill 需要的是专门构建的平铺归档。GitHub 提供的整个仓库压缩包通常带有外层目录，也可能包含与该 Skill 无关的文件，不能直接替代。

其次，自有域名上的下载请求可以在自己的服务器或边缘日志中观察，方便统计索引访问和文件下载。

还有一个更直接的原因，可以对最终发布的文件计算摘要。

假设索引指向 `main` 分支上的 raw 文件。发布索引时，内容与摘要一致。随后仓库有了新提交，raw 地址返回了新内容，索引却还保留旧摘要。符合规范的安装器就会拒绝安装，直到索引重新构建。

固定到提交 SHA 可以保持一致，但不会自动跟随最新版本。跟随分支能拿到新内容，却需要同步更新摘要。

重新托管可以把这几件事放进同一轮构建：

```text
读取仓库内容
    → 写入发布目录，或生成归档
    → 对最终文件计算摘要
    → 生成发现索引
```

这样，索引中的摘要对应的就是你实际提供下载的那份文件。

这是一种发布选择，不是协议对自有域名的强制要求。核心原则是对实际交付的文件计算摘要，并控制它与索引的更新关系。

也要分清完整性与内容审查。仓库里如果进入了错误或恶意内容，重新托管只会忠实地复制它，再生成一个正确摘要。摘要不能替代对源文件的审查。

## 四种安装方式，各有用途

发布页面可以先让用户选择 Claude Code、Cursor 和 Codex，再加上 GitHub Copilot 或 Gemini CLI，再展示对应的安装方式。同一份 Skill 内容可以复用，不需要为每个 Agent 重写一份。

命令里的域名、组织名和市场名称都是例子，发布时换成自己的。

### npx skills：从发现索引安装

```bash
npx skills add https://skills.example.com \
    --skill readme-guide -a claude-code -g
```

这条路径会读取发现索引，找到对应类型的文件，下载并验证摘要，再安装到目标工具。`-a` 指定 Agent，`-g` 表示用户级安装。

它走完从域名安装的整条路径，适合用来确认发现索引是否正常。

### Claude 插件市场：适合 Claude 用户与套装

```bash
claude plugin marketplace add example-org/agent-skills
claude plugin install readme-guide@example-marketplace
```

第一条命令添加市场，第二条安装插件。`@` 后面的 `example-marketplace` 来自仓库 `.claude-plugin/marketplace.json` 中的 `name`，不能根据仓库名称猜测。

这条路径只适用于 Claude。如果一个插件包含多个 Skills，一次插件安装就能交付整套内容。

### gh skill：直接从仓库安装

```bash
gh skill install example-org/agent-skills readme-guide
```

它直接从源仓库查找 Skill，不经过发现索引。对希望先阅读仓库内容、再从同一个来源安装的用户来说，这条路径很直接。

这里的安装对象是具体 Skill，套装不能简单当成一个同名 Skill 来处理。

### curl：适合不想额外引入安装器的环境

对于只有一个文件的 Skill，可以直接创建目录并下载：

```bash
mkdir -p ~/.claude/skills/readme-guide

curl -fsSL \
    https://skills.example.com/artifacts/readme-guide/SKILL.md \
    -o ~/.claude/skills/readme-guide/SKILL.md
```

对于已经按成员目录组织的套装归档，可以一次解压到公共目录：

```bash
mkdir -p ~/.claude/skills

curl -fsSL \
    https://skills.example.com/artifacts/writing-tools-bundle.tar.gz \
    | tar -xz -C ~/.claude/skills
```

这些命令依赖已有的基础工具，不必另装专门的 Skill 安装器，适合容器构建等场景。不过，直接下载和解压本身不会完成发现索引中的摘要验证。

四种入口看起来有些重复，实际服务的是不同使用习惯。有人用插件市场，有人信任仓库来源，有人需要带发现与校验的安装器，也有人只想在脚本里调用基础工具。发布方多维护几组命令，就能少让用户为安装方式绕路。

## 发布前做四项检查

很多分发问题只会在真正安装时暴露。发布前，应按安装器实际走过的路径检查。

### 检查索引

```bash
curl -fsSL \
    https://skills.example.com/.well-known/agent-skills/index.json
```

确认返回有效 JSON，列出了应该发布的 Skills，也没有混入不应发布的条目。

### 检查文件摘要

从索引中选一个 `url`，下载后计算 SHA-256：

```bash
curl -fsSL \
    https://skills.example.com/artifacts/readme-guide/SKILL.md \
    | sha256sum
```

将结果与 `digest` 中的十六进制值比较。macOS 可以用 `shasum -a 256` 代替 `sha256sum`。

这一步最容易发现“计算摘要的文件”和“实际提供下载的文件”不是同一份的问题。

### 检查归档层级

```bash
tar -tzf readme-guide.tar.gz
```

对于单个 Skill，`SKILL.md` 应当位于根目录，而不是 `readme-guide/SKILL.md`。多包一层目录，安装后文件就会落得过深。

### 做一次真实安装

```bash
npx skills add https://skills.example.com --skill readme-guide
```

确认文件进入目标 Agent 的 Skills 目录，再提出一项它应该处理的任务，观察 Agent 是否加载并使用它。

安装正常只说明分发链路可用。真正触发一次，才能知道 `description` 有没有把适用场景写清楚。

## 在流量到来之前准备统计

发布之后，还需要知道用户选择了哪些 Skill、哪些 Agent 和哪些安装方式。统计应在上线时就准备好，而不是等到有人使用之后再补。

安装入口上可以记录这些操作：

* 点击按钮复制安装命令，并记录目标 Agent 和安装方式。
* 手动选中并复制命令。
* 复制完整的 `SKILL.md`。
* 下载归档。
* 跳转到 GitHub 源码。

这些事件反映的是人在安装入口上的操作。它们看不到对方是否真的在终端执行了复制的命令，因此还需要另一组信号：索引和文件的 HTTP 请求。

`/.well-known/agent-skills/index.json` 与每个 Skill 的下载地址，都是普通 HTTP 资源。可以在边缘或服务器端依据 `User-Agent` 分类，观察哪些客户端在解析这份索引、请求这些下载地址。

页面交互说明人们在选择什么，请求日志说明哪些内容被实际获取。两组数据应分别看待，不能把埋点准备完成当成已经证明了发布效果。

## 交给 Agent 的说明

前面是给人看的发布步骤。下面这段直接交给 Agent：什么时候动手，按什么顺序做，哪些做法不要碰，做完如何验收。它不负责写某一个 Skill 的正文。

贴进当前对话即可。尖括号换成自己的值。`<origin>` 是带协议、不带路径的域名根地址，例如 `https://skills.example.com`。仓库、发布域名和目标 Agent 也一起告诉它。

````markdown
当用户要发布、分发或共享 Skills 时，按下面的步骤做：让技能能通过 `npx skills`、`gh skill` 或 Claude 插件市场安装；建立或修复 `.well-known/agent-skills/index.json`；把文件放在自己控制的域名上，并为实际提供下载的字节计算完整性摘要；决定单文件、多文件还是套装；或者给安装行为做统计。也用于纠正一个常见错误：把发现索引指向 raw.githubusercontent.com，而不是指向自己控制的域名。

不要用来编写某一个 Skill 的正文，那是写一份 `SKILL.md`。也不要用来让页面能被 LLM 阅读，那是 `llms.txt` 或 Markdown 内容协商，另一件事。

按下面的步骤发布一批技能，让编程 Agent 自己找到并装上，不必每次由你递一个地址。机制是固定路径上的一份发现索引。索引做对了，`npx skills`、`gh skill` 和 Claude 插件市场都能解析这些技能。

## 工作流

第 1 到第 5 步前后依赖。第 6 到第 8 步可以单独交付。

### 1. 在 Git 仓库里维护每一项技能

每项技能放成 `skills/<name>/SKILL.md`。仓库不是可选项，因为有两条安装路径直接从仓库解析：

- `gh skill install <owner>/<repo> <name>` 从仓库读取 `SKILL.md`。
- Claude 插件市场从带有根目录 `.claude-plugin/marketplace.json` 的仓库安装。清单里的 `name` 就是 `claude plugin install <skill>@<marketplace>` 里 `@` 后面的那一段。读清单，不要用仓库名去猜。

仓库也是审查、保留版本、继续改这份技能的地方。把它当代码对待。

### 2. 先判断每一项的形态

三种形态，后面每一层的处理都不一样。发布前先分类：

- 单文件：目录里只有 `SKILL.md`。安装就是复制一个文件，也短到可以直接贴进正在运行的 Agent。
- 多文件：`SKILL.md` 之外还有脚本、参考资料或模板。不能靠复制一个文件完成安装，必须打成归档。
- 套装：一个仓库同时发布多项技能。每一项单独发布、单独安装。套装是容器，不是一项技能，自己没有 `SKILL.md`。

形态判错是最常见的发布故障：把多文件技能当成单文件，安装会悄悄丢掉除 `SKILL.md` 以外的全部文件。

### 3. 从自己控制的域名提供文件，并对实际提供的字节计算摘要

这一步最容易被跳过，也最要紧。每一份 `digest` 都要对你实际提供下载的那一份字节计算，并且和提供下载发生在同一处。具体做法：在生成发布文件的那个环节（静态站点构建、CI、一段 shell，或写入对象存储的服务）从仓库取出载荷，写进你自己的发布产物，再对写下的那个文件做哈希。

把 `url` 指到 `raw.githubusercontent.com`，等于为一份你控制不了交付的字节公布哈希。仓库被强推，或托管方改变 raw 文件的提供方式，已经公布的摘要后面的字节就变了。完整性检查会失败，安装会一直被拒绝，直到你重新构建。

重新托管去掉这个故障，还多一个好处：每次构建都从你自己的副本重算摘要，所以可以跟踪仓库的默认分支，而不必钉死某一次提交。上游推送会在你下一次部署时带上新的、正确的哈希上线。

它买到的是一致，不是对上游内容的免疫。错误的推送会被同样忠实地重新托管并计算摘要。摘要保护的是从你到安装器这一段；仓库里放进什么，仍然要你自己审查。跟踪一条你审查过的分支。

记住这条：源文件放哪里都行；提供下载的文件，和计算摘要，要在同一处完成。

### 4. 做出你要提供下载的归档

按形态，在自己的域名上放一个稳定地址：

- 单文件：原样提供 `SKILL.md`，例如 `<origin>/agent-skills/<name>/SKILL.md`。
- 多文件：一份平铺的 `.tar.gz`。`SKILL.md` 和其余文件在归档根目录，不要再包一层目录。安装器会把归档解进该技能自己的目录。
- 套装：一份 `<bundle>-bundle.tar.gz`。各项技能以 `<name>/` 并列放在归档根目录，不再套一层套装目录。这样 `curl … | tar -xz -C <skills-dir>` 一次就能全部落下。
- 给人看的可选 ZIP：顶层包一层 `<name>/`，方便下载后阅读。它和平铺的安装归档分开，也不写进发现索引。指向它的条目解出来会深一层。

打包和计算摘要放在同一次里做。`.tar.gz` 里不只有文件内容：成员顺序、当时 umask 留下的权限、嵌入的修改时间、gzip 自己的时间戳，都会让同一份技能打两次包得到不同哈希。一起做，两者就不会不一致。如果两件事可能被拆开（一次构建发布索引、另一次上传归档；CDN 还在提供昨天的压缩包；或者有人要独立复现你的摘要），把这些不确定因素也钉死。GNU tar 的参数在 macOS 上用 `gtar`：

```bash
# 平铺、可复现的多文件技能归档
cd <skill-dir>
find . -type f -exec chmod 0644 {} +
# 只有随包发布的脚本才 chmod 0755
tar --sort=name --owner=0 --group=0 --numeric-owner \
    --mtime='UTC 2020-01-01' -cf - * \
  | gzip -n > ../<name>.tar.gz
```

在技能目录内部运行 `tar`，归档才会是平的。套装则在上一层目录运行同一条命令，让每个 `<name>/` 并列出现在归档根目录。

发布出来的目录类似：

```text
.well-known/agent-skills/index.json
agent-skills/good-readme/SKILL.md
agent-skills/pdf-extract.tar.gz
agent-skills/testing-bundle.tar.gz
```

`good-readme` 是单文件，`type` 用 `skill-md`。`pdf-extract` 是多文件，`type` 用 `archive`。套装压缩包只是方便一次下载，不是索引里的一条。

### 5. 写发现索引

在域名根路径发布 `/.well-known/agent-skills/index.json`，响应类型为 `application/json`。这就是安装器要找的文件：`npx skills add <origin>` 会请求 `<origin>/.well-known/agent-skills/index.json`。传给它的地址必须是带协议的域名根，不能少，也不能多：

- 没有协议（`skills.example.com`、`owner/repo`）：安装器把它当成要克隆的 Git 仓库，而不是要读取索引的域名。
- 带了路径（`<origin>/agent-skills`）：安装器只在该路径下找索引，不会再回退到域名根上的那一份。

格式不是某一家安装器私有的。它指向 agentskills.io 的发现 schema：

```json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "good-readme",
      "description": "Agent 用来判断该不该用这项技能的那一句「在这种时候用」。",
      "type": "skill-md",
      "url": "https://skills.example.com/agent-skills/good-readme/SKILL.md",
      "digest": "sha256:9f2b…"
    },
    {
      "name": "pdf-extract",
      "description": "多文件技能的那一句「在这种时候用」。",
      "type": "archive",
      "url": "https://skills.example.com/agent-skills/pdf-extract.tar.gz",
      "digest": "sha256:1c4a…"
    }
  ]
}
```

顶层只有两个键：`$schema` 和 `skills`。每项技能五个字段：

- `name`：安装器使用的标识。必须是合法的技能名（小写字母、数字、单个连字符），否则安装器会拒绝。整个索引里必须唯一：安装器按 `name` 索引，重名会盖掉前一条，而不是新增。构建时遇到重名就失败。
- `description`：Agent 用来判断相关性的那一句。从该技能自己的 front matter 复制。
- `type`：单文件用 `skill-md`（`url` 就是那份 `SKILL.md`）；多文件用 `archive`（`url` 是压缩包）。
- `url`：字节所在的地址。按第 3 步，放在你自己的域名上。
- `digest`：`url` 上那一份字节的 `sha256:`。校验是必须做的：符合规范的客户端必须重新计算下载内容的摘要，并且不得使用校验失败的内容。摘要错了不是降级安装，而是挡住安装。

套装只通过它的成员出现在索引里，每一项用自己的名字做一条普通条目，再加上第 4 步那份组合归档供下载。不要为套装整体建一条，也不要加 `version`、`origin`、`bundles`。

### 6. 给出不止一种安装命令

用户用的工具不一样，只留一条命令，不用这条命令的人就走了。`SKILL.md` 是跨 Agent 的，载荷相同，变的只是目标目录（`~/.claude/skills`、`~/.cursor/skills`、`~/.agents/skills`、`~/.copilot/skills`、`~/.gemini/skills`）。提供这几种：

- `npx skills`：读发现索引。`npx skills add <origin> --skill <name> -a <agent> -g`。去掉 `--skill` 是交互选择，`--skill '*'` 安装全部。
- `claude plugin`：Claude 的插件市场，也是套装最合适的路径，一次安装拿下整套。先 `claude plugin marketplace add <owner>/<repo>`，再 `claude plugin install <skill>@<marketplace>`。`@` 后面是该仓库 `.claude-plugin/marketplace.json` 里的 `name`，不一定等于仓库名。读它，不要假设。
- `gh skill`：从仓库安装一项技能。`gh skill install <owner>/<repo> <name>`。套装名不能这么装，因为它不对应某一个技能目录。
- `curl`：不额外引入安装器，也是唯一一种事先什么都不用装的方式。命令跟着第 4 步的形态走。

单文件：

```bash
curl -fsSL --create-dirs \
  <origin>/agent-skills/<name>/SKILL.md \
  -o <skills-dir>/<name>/SKILL.md
```

多文件：平铺压缩包解进该技能自己的目录。

```bash
mkdir -p <skills-dir>/<name>
curl -fsSL <origin>/agent-skills/<name>.tar.gz \
  | tar -xz -C <skills-dir>/<name>
```

套装：每一项已经是一个目录，解进 Skills 的公共目录。

```bash
mkdir -p <skills-dir>
curl -fsSL <origin>/agent-skills/<bundle>-bundle.tar.gz \
  | tar -xz -C <skills-dir>
```

`mkdir -p` 不能省。目标目录不存在时，`tar -C` 会因为无法进入该目录而失败。这几条直接下载本身不做发现索引里的摘要校验。

按谁会复制来配命令：要插件市场的人、写脚本的人、习惯从仓库安装的人、跟着步骤走只想要一条可复制命令的人，各留一条。

### 7. 给安装做统计（可选）

你看不到别人电脑上跑的那条 `curl`，但你能测量自己提供的部分：

- 展示安装命令的地方（文档页、落地页、README）：复制了哪条命令、哪个 Agent、哪种方式，以及 `SKILL.md` 全文复制和跳到源码仓库的点击。
- 服务器一侧：对 `/.well-known/agent-skills/index.json` 和每个技能 `url` 的请求，按 `User-Agent` 分类。先拆开这些类别再相信总数。打到一份固定路径文件上的「Agent」流量，多数是通用爬虫，不是你关心的安装器。
- 按来源页面：同一组安装命令出现在不止一个页面时，给每条事件带上来源页面标识。否则你只知道哪项技能被安装，不知道是哪个页面带来的。

### 8. 验收

- `curl -fsSLI <origin>/.well-known/agent-skills/index.json` 的 `content-type` 是 `application/json`。
- 对同一地址 `curl -fsSL`，得到有效 JSON，列出你打算发布的每一项，没有多出来的。
- 任选一条，`curl -fsSL <url> | sha256sum` 与公布的 `digest` 一致。摘要算的不是你实际提供的那份文件时，这一步会静静失败。
- `tar -tzf <name>.tar.gz` 在归档根目录列出 `SKILL.md`，而不是 `<name>/SKILL.md`。
- `npx skills add <origin> --skill <name>` 能装进目标 Agent 的 Skills 目录。再向 Agent 提一个这项技能该处理的任务，看它会不会加载。这是检验 `description` 有没有写到触发条件的唯一办法。

## 不要做这些

- 不要把发现索引指向 `raw.githubusercontent.com`，或任何不是由你构建出来的主机。摘要和实际提供的字节会分开，安装会坏。重新托管，并对自己的副本计算摘要。
- 不要只为躲开 raw URL 的问题去钉死某次提交。重新托管做对了，就可以安全地跟踪默认分支；钉死提交只会让技能变旧。
- 不要在单个技能的归档里再包一层目录。安装器把平铺归档解进技能目录；`<name>/<name>/SKILL.md` 会让安装失败。
- 不要为整个套装只写一条发现条目。每一项用自己的名字单独列出。安装器按 `name` 索引。
- 不要自造 schema 里没有的字段：顶层的 `version`、`origin`，`bundles` 数组，或每项技能上的 `bundle`。多出来的字段安装器不会读。
- 不要公布一份你复现不了的摘要。把哈希和打包拆开，又留下不确定的压缩包（权限没钉、成员没排序、修改时间是当下的、没用 `gzip -n`），技能没改，你公布的哈希也会对不上你提供的文件。
- 不要省掉 `digest`。没有完整性哈希，安装器无从校验；损坏或被换掉的载荷会静静装上。
- 传给 `npx skills` 的只能是带协议的域名根。带路径会把查找限定在该路径下，且不会回退到根；不带协议会被当成 Git 仓库去克隆。传 `<origin>`。
- 不要只留一种安装命令。多留几种成本很低，差别是读者装上了，还是关掉了。

## 最后检查

1. `/.well-known/agent-skills/index.json` 存在，以 `application/json` 提供，是有效 JSON，每一项都有 `name`、`description`、`type`、`url`、`digest`。
2. 每个 `url` 都在你控制、并由你构建的域名上，没有 raw 仓库地址。
3. 每个 `digest` 都与该 `url` 上实际提供的字节一致。
4. 单文件是 `type: skill-md`；多文件是 `type: archive`，且压缩包是平的；套装里的每一项各有一条，名称在整个索引里唯一。
5. 至少 `npx skills` 再加上一种从仓库安装的方式（`gh skill` 或 Claude 插件市场）能装成功。
````

贴进去之后，Agent 按这份说明执行。

## 发布 Skill，不需要另造一套分发系统

Skill 的内容形式比较新，发布方法却很熟悉：一个固定位置的索引、每份安装文件的明确地址，以及客户端在使用前验证的摘要。

先在仓库中维护和审查内容，再按照单文件、多文件或套装的形式交付。让索引描述实际发布的文件，为不同工具提供可用的安装入口，最后用一次真实安装检验整条流程。

做到这些，一份工程经验才从“别人可以读到的文档”，变成了“别人的 Agent 可以安装并采用的方法”。
