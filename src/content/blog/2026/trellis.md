---
title: 介绍 Trellis
tags:
  - AI
  - skill
  - 工作流
category: 技术
hero: ./trellis.png
heroCopyright: Logo from <a href="https://github.com/mindfold-ai/Trellis">mindfold-ai/Trellis</a>
type: post
date: 2026-09-18 10:00:00
---

## 什么是 Trellis

[Trellis](https://github.com/mindfold-ai/Trellis) 不是模型，也不是编辑器。它是套在 Cursor、Claude Code、Codex 等 coding agent 外面的一层脚手架：把规范、任务和会话记录放进仓库，在写代码之前，按这一次任务把该读的内容注入进去。

从结构上看，它是两套系统，共用同一批项目文件。一套约束工作如何推进，包括工作流状态、hook、skill、sub-agent，以及接到各个工具的适配层。另一套是放在仓库里的知识库：规范、任务、调研笔记和 journal 都在文件里，新会话从文件重新加载，而不是从上一轮对话里回忆。

长期约定在 `.trellis/spec/`，按模块拆分。这一次的需求在 `.trellis/tasks/`，一事一目录。每个人的进度在 `.trellis/workspace/` 的 journal 里，按开发者隔离。`workflow.md`、规范和任务随 git 分发；journal 不混进共享规范。多个窗口可以并行处理不同任务，当前任务绑定在本次会话上。

「按我们的规范写」无法在事后核对。若订单状态必须为枚举、不得为自由字符串，并写在 `.trellis/spec/` 的某一页中，下一次会话仍能打开这一页。前者是当次的口头要求，后者是可以复查的文件。对我来说，Trellis 约束的是后者。

## 设计理念

Trellis 把 AI coding 当作工作流和知识管理，而不是一次聊天。

工作流状态是显式的。任务有 `planning`、`in_progress` 等状态，支持 hook 的工具会在每条消息中注入当前阶段的下一步。没有这层注入的工具，由主会话自行读取文件。

持久知识放在文件里。需求、规范、调研和 journal 位于 `.trellis/`，不只留在对话历史中。上下文范围也被收住：`implement.jsonl` 与 `check.jsonl` 只列出本次需要的规范和调研，一行一个文件，并注明读取原因，而不是把整个仓库塞进上下文。

职责是分开的。调研、实现、验收分别由 `trellis-research`、`trellis-implement`、`trellis-check` 承担。实现和检查在改文件之前先读需求与相关规范。检查对照同一份需求审查 diff，并运行项目自身的 lint、类型检查与测试。

收尾边界也是分开的。实现与检查产出通过检查的 diff；提交由主会话在确认后执行，不 amend，不 push；`/trellis:finish-work` 只负责归档和写 journal。相关改动尚未提交时，这个命令会停止。

团队与工具共用同一套事实来源。规范与任务进 git，一个人整理出的约定可以给整个团队用。多数步骤由 brainstorm、before-dev、check、update-spec 等 skill 按情境触发，不需要逐条记忆命令。任务里稳定下来的经验可以写回 `.trellis/spec/`，供以后的任务复用。

## 基本用法

仓库中还没有 `.trellis/` 时，需要 Node.js 18+ 与 Python 3.9+。

```bash
npm install -g @mindfoldhq/trellis@latest
cd your-project
trellis init -u your-name
```

`your-name` 是 journal 目录名，对应 `.trellis/workspace/your-name/`。若只使用某一个工具，可以在初始化时写明，例如 `trellis init -u your-name --cursor`。此后 `trellis upgrade` 升级本机命令，`trellis update` 同步项目模板。规范与任务不会被模板更新覆盖。

一次任务按这个顺序进行。

用自然语言说明要做什么。例如，为订单接口增加一个状态字段。

它一次询问一个问题：状态有哪些取值、哪些角色可以修改、既有数据如何迁移。答案写入该任务的 `prd.md`。改动范围较大时，开始实现之前还需要 `design.md` 与 `implement.md`。任务创建后处于规划状态，确认开始之后才进入实现。未经确认，不修改代码。

然后让它执行。实现角色按需求和相关规范修改代码，检查角色对照同一份需求验收。需要先调查的问题，例如状态字段是否应复用既有枚举，结论写入任务的 `research/`。

工作完成后先提交，再输入 `/trellis:finish-work`。它归档任务，并在 journal 中记录这次决定。继续当前任务使用 `continue`。没有自动注入的平台，会话开始时先输入 `start`。

改动很小，例如只修改一处文案，同样会询问是否建立任务。若明确不需要，则本次直接修改。

流程本身定义在 `.trellis/workflow.md`，分为规划、实现与验收、收尾三个阶段。若要调整阶段，应修改这个文件，而不是修改全局安装目录。

## 仓库与文档

- 仓库：[mindfold-ai/Trellis](https://github.com/mindfold-ai/Trellis)
- 文档：[docs.trytrellis.app](https://docs.trytrellis.app/)
- 中文文档：[docs.trytrellis.app/zh](https://docs.trytrellis.app/zh)
