---
title: Grill with Docs：对着代码库把计划问清楚
tags:
  - AI
  - skill
  - 工作流
category: 技术
hero: ./grill-with-docs-hero.png
heroCopyright: Image from <a href="https://www.aihero.dev/skills-grill-with-docs">AI Hero</a>
type: post
date: 2026-10-13 15:00:00
---

## 什么是 Grill with Docs

[grill-with-docs](https://www.aihero.dev/skills-grill-with-docs) 不是拿来直接改代码的 skill。它追问一份计划或设计，直到你和 agent 对这件事有同一套说法，并把谈定的词汇、以及够格的决定写进仓库。

追问节奏和 [grill-me](/2026/grill-me) 一样：一轮问题，等你答，再算下一轮。差别有两处。一是对着代码库，能从仓库里读到的答案就不问你。二是有状态：词一敲定，立刻写进根目录 `GLOSSARY.md`；决定过了三道门槛，写成 `docs/adr/` 里的 ADR。文件用到才建，不必事先准备。

它自己的 `SKILL.md` 只有一行，真正干活的是 grilling（追问）和 domain-modeling（落笔）。这两个没装上，装了也等于没装。

## 设计理念

agent 不会自己掏出这个 skill。要你输入 `/grill-with-docs`。

官网上按手头东西选入口：没有工作目录，用 grill-me；仓库里有一次会话谈得完的改动，用 grill-with-docs；一次会话装不下的大范围，用 wayfinder；卡在别人脑子里的知识，用 to-questionnaire。仓库里还没有领域文档，也可以把目标对准整仓，而不是某一个功能。

会话结束会留下三类东西，分量不一样。项目自己的叫法，进 `GLOSSARY.md`，而且是边谈边写，不是收工再补。难逆转、缺了上下文会让人意外、又真做过取舍的决定，进 ADR。其余谈定的内容只留在这次对话里。`GLOSSARY.md` 是词表，不写实现，也不当规格。多数决定过不了 ADR 的三道门，词表变清楚、ADR 为零，仍算正常。

主产物是领域语言：同一套词，你、agent 和同事不用再各猜各的。官网也写过反对意见：模型和「这个词的白话解释」表现差不多，词表主要方便人。即便如此，它仍然值得写。

它排在主链路最前：`grill-with-docs → to-spec → to-tickets → implement → code-review → retro`。规格还没开写之前，先把理解和用词谈稳；后面的 to-spec 不必再问一轮。

## 基本用法

先处在一个写得起文件的仓库里。多上下文仓库若根上有 `GLOSSARY-MAP.md`，词会落到对应上下文的 `GLOSSARY.md`。

**改动还模糊，名字也没定稳。** 开一次新会话，关掉会催着产出计划的模式，输入：

```text
/grill-with-docs
```

然后直接说你要改什么。例如：「订单状态要支持取消，但仓库里 status、流转、取消这几个词用法不一致，先把说法对齐。」它会读相关代码，按轮提问。你定下一个词，`GLOSSARY.md` 就多一行或改一行。够格的取舍才进 ADR。

**仓库几乎没有领域文档。** 同一条命令，把目标对准整仓：

```text
/grill-with-docs
help me document my repo
```

它会读代码，把看到的叫法抛回来让你拍板，哪些词该进词表由你定。官网建议你要主动带方向，不要指望它一次猜对。

**一轮问完之后。** 不要清掉上下文另开空会话。主流程里，同一段对话接着交给 to-spec；改动很小、已经能动手，也可以直接 implement。词表不是规格，多数回答也不会变成 ADR，精确约定（顺序、否定条件、数字默认值）若只留在聊天里，后面步骤容易写软——所以要在同一段上下文里往下接。

**看起来不对劲时。** 一次抛出所有问题、也不提 `GLOSSARY.md`，多半是 grilling 或 domain-modeling 没加载。可以直接问：

```text
你这次加载了哪些 skill？grilling 和 domain-modeling 在吗？
```

追问在进行、文件始终没有：有时是本轮没有新词、也没有够格的 ADR；有时是嵌在别的编排层里时写入半边静默失败。先确认当前工作目录，再决定信不信这次输出。

跑得正常时，你会看到：`GLOSSARY.md` 在会话中途一行行变；词表里只有紧的定义，没有规格腔；仓库能答的问题它自己读完了；ADR 很少，留下的都是你懒得再吵一遍的决定；你随口用的词若和既有词表冲突，它会顶回来。

## 仓库与文档

- 说明：[Grill with Docs](https://www.aihero.dev/skills-grill-with-docs)
