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

`npx skills` 会读这份索引。Skill 写在 GitHub 仓库里，安装器和 Claude 的插件市场可以直接从仓库取；发出去的字节放在你自己的域名上，摘要就按这一份来算。形态分三种：单文件、多文件、套装，各有各的处理。安装命令多留几种，因为读者用的工具不一样。

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

这里要保留完整的 `https://` URL。`owner/repo` 形式会被当作 Git 仓库来源，不能用省略协议的写法代替完整的 `https` 地址。尽量使用域名根地址；附带路径会限定索引查找范围，不应依赖安装器继续回退到根目录。

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

归档与摘要最好在同一轮构建中生成。压缩包包含的不只是正文：文件顺序、权限、修改时间，以及 gzip 自身的时间戳都会影响最终字节。同一组源文件打包两次，也可能得到不同摘要。

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

还有一个更直接的原因：可以对最终发布的文件计算摘要。

假设索引指向 `main` 分支上的 raw 文件。发布索引时，内容与摘要一致；随后仓库有了新提交，raw 地址返回了新内容，索引却还保留旧摘要。符合规范的安装器就会拒绝安装，直到索引重新构建。

固定到提交 SHA 可以保持一致，但不会自动跟随最新版本。跟随分支能拿到新内容，却需要同步更新摘要。

重新托管可以把这几件事放进同一轮构建：

```text
读取仓库内容
    → 写入发布目录，或生成归档
    → 对最终文件计算摘要
    → 生成发现索引
```

这样，索引中的摘要对应的就是你实际提供下载的那份文件。

这是一种发布选择，不是协议对自有域名的强制要求。核心原则是：对实际交付的文件计算摘要，并控制它与索引的更新关系。

也要分清完整性与内容审查。仓库里如果进入了错误或恶意内容，重新托管只会忠实地复制它，再生成一个正确摘要。摘要不能替代对源文件的审查。

## 四种安装方式，各有用途

发布页面可以先让用户选择 Claude Code、Cursor、Codex、GitHub Copilot 或 Gemini CLI，再展示对应的安装方式。同一份 Skill 内容可以复用，不需要为每个 Agent 重写一份。

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

四种入口看起来有些重复，实际服务的是不同使用习惯：有人用插件市场，有人信任仓库来源，有人需要带发现与校验的安装器，也有人只想在脚本里调用基础工具。发布方多维护几组命令，就能少让用户为安装方式绕路。

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

`/.well-known/agent-skills/index.json` 与每个 Skill 的下载地址，都是普通 HTTP 资源。可以在边缘或服务器端依据 `User-Agent` 分类，观察哪些客户端在解析目录、获取文件。

页面交互说明人们在选择什么，请求日志说明哪些内容被实际获取。两组数据应分别看待，不能把埋点准备完成当成已经证明了发布效果。

## 把发布方法本身做成一个 Skill

前面讲的是如何发布 Skills。这套流程本身也可以做成一份 Skill。它不教 Agent 去写某一项技能的业务内容，而是让 Agent 建立目录、打包文件、生成发现索引，并验证安装。

把下面的代码保存为 `skills-visibility/SKILL.md`，放进目标 Agent 的 Skills 目录，也可以直接贴进对话，让它按这套流程处理当前项目。尖括号里的内容要换成自己的值。`<origin>` 是带协议、不带路径的域名根地址，例如 `https://skills.example.com`。仓库、发布域名和目标 Agent 也要一并告诉它。

```markdown
---
name: skills-visibility
description: >-
    发布 Agent Skills 目录，使 AI 编程工具及其安装器能够发现和安装这些技能。
    当用户需要发布、分发或共享 Skills，配置 npx skills、gh skill 或 Claude
    插件市场安装，创建或修复 .well-known/agent-skills/index.json，
    在自有域名托管文件并生成完整性摘要，选择单文件、多文件或套装打包方式，
    或配置安装统计时使用。
    不用于编写单个 Skill 的业务内容，也不用于 llms.txt 或 Markdown 内容协商。
---

# 发布可发现、可安装的 Agent Skills

按以下步骤建立 Skills 发布目录。维护源文件、生成安装文件、计算摘要和生成索引
应形成一致的发布流程。前五步相互依赖，安装入口、统计和验证分别安排。

## 1. 在 Git 仓库中维护源文件

将每项技能组织为 skills/<name>/SKILL.md，附带文件与入口一起维护。
通过版本控制和代码审查管理修改。

仓库同时支持两类直接安装：

* gh skill install <owner>/<repo> <name>
* Claude 插件市场：在仓库根目录维护 .claude-plugin/marketplace.json。

读取市场清单中的 name，作为安装命令里的 @marketplace 名称；不要根据仓库名猜测。

## 2. 先判断发布形式

逐项检查文件结构，再决定打包方式：

* 单文件：目录中只有 SKILL.md，直接发布 Markdown。
* 多文件：除 SKILL.md 外还有脚本、参考资料或模板，必须将附件一起打包。
* 套装：一个仓库发布多个独立 Skills。套装只是容器，不要求有自己的 SKILL.md。

不要把多文件 Skill 当作单文件发布，否则安装会遗漏附件。

## 3. 在受控域名发布，并对实际文件计算摘要

从源仓库读取内容，将文件写入发布目录或对象存储的发布位置。
对最终提供下载的文件计算 SHA-256，不能用源目录或另一份文件的摘要代替。

本工作流采用自有域名重新托管，不把索引直接指向会随分支变化的 raw 文件。
否则仓库更新后，下载内容可能已经变化，索引却仍保留旧摘要，导致安装失败。

重新托管后，可以在每次构建中读取经过审查的默认分支，并同步更新文件和摘要。
它保证发布内容与摘要一致，不保证上游内容安全。源文件仍需审查。

## 4. 根据形式生成发布文件

* 单文件：直接提供 /agent-skills/<name>/SKILL.md。
* 多文件：提供平铺的 <name>.tar.gz，SKILL.md 和附件位于归档根目录。
* 套装：另提供 <bundle>-bundle.tar.gz，各成员以 <name>/ 目录并列放置，
    不再套一层 bundle 目录。
* 可选的人类阅读版本：提供带顶层 <name>/ 目录的 ZIP，方便下载和浏览。
    它与供安装器使用的平铺归档分开，不写入发现索引。

归档和摘要在同一轮构建中生成。若它们可能来自不同构建，进一步固定文件顺序、
权限、所有者和修改时间，并使用 gzip -n 去掉压缩头中的名称与时间戳信息。
GNU tar 参数不能直接假定在所有平台可用；macOS 可使用 gtar。

发布目录可以是：

```text
.well-known/agent-skills/index.json
agent-skills/readme-guide/SKILL.md
agent-skills/pdf-extract.tar.gz
agent-skills/writing-tools-bundle.tar.gz
```

组合归档是便捷下载入口，不单独作为一个 Skill 写入索引。

## 5. 生成发现索引

在域名根路径发布 /.well-known/agent-skills/index.json，
使用 application/json 响应类型。

采用 https://schemas.agentskills.io/discovery/0.2.0/schema.json，
顶层使用 $schema 和 skills。每个 Skill 条目包含：

* name：符合 Skill 命名规则，在整个索引中唯一；遇到重名时使构建失败。
* description：从该 Skill 的 front matter 复制适用场景描述。
* type：单文件使用 skill-md，多文件使用 archive。
* url：指向已发布的 Markdown 或归档文件。
* digest：对该 URL 实际提供的文件计算摘要，格式为 sha256:<hex>。

套装的每个成员分别建立普通条目。不要创建套装整体条目，
也不要自行添加 version、origin、bundles 或 per-skill bundle 字段。

摘要验证是必需步骤。符合发现规范的客户端必须重新计算下载内容的摘要，
并拒绝使用不匹配的文件。

给 npx skills 的地址必须是带协议的域名根，例如 https://skills.example.com。
省略协议会被当作仓库来源；增加路径会限定索引查找范围，不能指望回退到域名根目录。

## 6. 提供多种安装入口

按目标 Agent 生成命令，区分用户级与项目级安装位置。
同一份 Skill 内容可以复用，不要为不同工具复制维护相同正文。

从发现索引安装：

```bash
npx skills add <origin> --skill <name> -a <agent> -g
```

省略 --skill 可交互选择，使用 --skill '*' 可安装全部。

Claude 插件市场：

```bash
claude plugin marketplace add <owner>/<repo>
claude plugin install <plugin>@<marketplace>
```

套装可以通过包含多个 Skills 的插件一次安装。

直接从仓库安装单个 Skill：

```bash
gh skill install <owner>/<repo> <name>
```

不要把没有对应单个 Skill 目录的套装名称传给它。

基础工具安装按发布形式分别处理：

```bash
# 单文件
curl -fsSL --create-dirs \
    <origin>/agent-skills/<name>/SKILL.md \
    -o <skills-dir>/<name>/SKILL.md

# 多文件：解压到该 Skill 自己的目录
mkdir -p <skills-dir>/<name>
curl -fsSL <origin>/agent-skills/<name>.tar.gz \
    | tar -xz -C <skills-dir>/<name>

# 套装：解压到 Skills 公共目录
mkdir -p <skills-dir>
curl -fsSL <origin>/agent-skills/<bundle>-bundle.tar.gz \
    | tar -xz -C <skills-dir>
```

不要省略目录创建；目标目录不存在时，tar -C 会失败。
以上直接下载命令本身不执行发现索引中的摘要验证。

## 7. 配置统计（可选）

在展示安装命令的页面记录命令复制、目标 Agent、安装方式，
以及 SKILL.md 全文复制、归档下载和源码链接点击。

在服务器端记录索引和各个文件 URL 的请求，按 User-Agent 分类。
将通用爬虫与实际安装客户端分开，不要直接把总请求数当作安装量。

如果多篇页面展示相同的安装入口，在事件中附上来源页面标识，
以便区分哪个页面带来了操作。

## 8. 验证发布结果

* 请求索引响应头，确认 Content-Type 为 application/json。
* 获取索引正文，确认 JSON 有效，条目包含全部预期 Skills。
* 选择一个文件，从线上 URL 下载并计算 SHA-256，与 digest 比较。
* 用 tar -tzf 检查单个 Skill 的归档，确认 SKILL.md 位于根目录。
* 通过 npx skills 从域名安装，确认文件落在目标 Agent 的正确目录。
* 提出 Skill 适用的任务，观察 Agent 是否加载它，以验证 description 的触发效果。

## 避免这些错误

* 发布会随仓库分支变化的 raw URL，却未同步更新摘要。
* 多文件 Skill 只交付 SKILL.md，遗漏脚本和资料。
* 单个 Skill 归档多套一层目录，形成 <name>/<name>/SKILL.md。
* 将整个套装作为一个索引条目，而不是逐个列出成员。
* 使用重复名称，或自行增加安装器不理解的索引字段。
* 分开打包与计算摘要，同时保留不确定的归档元数据。
* 省略 digest，或在摘要生成后重新生成发布文件。
* 给按域名安装的命令传入不带协议的域名，或错误的子路径。
* 只提供一种安装方式，让使用其他工具的人自行摸索。

## 最终交付检查

1. 索引路径正确，以 application/json 提供，每个条目都有五个必要字段。
2. 所有文件均从受控发布位置提供，摘要与线上字节一致。
3. 单文件、多文件和套装成员的类型、归档结构及条目组织正确。
4. 整个索引中的 Skill 名称唯一。
5. 至少验证 npx skills 和一种仓库安装方式（gh skill 或 Claude 插件市场）。
```

Agent 读到的是一份工作说明：什么时候用、交付哪些文件、哪些做法要避开、怎样验收。文章给人读，Skill 给 Agent 执行。两者可以一起发布。

## 发布 Skill，不需要另造一套分发系统

Skill 的内容形式比较新，发布方法却很熟悉：一个固定位置的索引、每份安装文件的明确地址，以及客户端在使用前验证的摘要。

先在仓库中维护和审查内容，再按照单文件、多文件或套装的形式交付；让索引描述实际发布的文件，为不同工具提供可用的安装入口，最后用一次真实安装检验整条流程。

做到这些，一份工程经验才从“别人可以读到的文档”，变成了“别人的 Agent 可以安装并采用的方法”。
