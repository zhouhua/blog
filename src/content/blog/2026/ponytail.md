---
title: Ponytail：让 AI agent 只写能工作的最少代码
tags:
  - AI
  - skill
  - 工作流
category: 技术
hero: ./ponytail-hero.png
heroCopyright: Image from <a href="https://ponytail.dev">ponytail.dev</a>
type: post
date: 2026-10-13 15:05:00
---

## 什么是 Ponytail

[Ponytail](https://ponytail.dev) 是一套给 AI coding agent 用的规则。装上之后，agent 写代码前先按固定顺序想清楚：这件事要不要存在，仓库里有没有现成的，标准库、平台能力、已装依赖够不够用，能不能写成一眼读懂的一行；都不行，才写刚好能工作的最少代码。

官网用一个老员工作比方：马尾、椭圆眼镜，在公司待得比版本管理还久。你给他看五十行，他不说话，换成一行。懒的是解法。读代码、追调用、把改动波及的调用方和测试收完，这些不能懒。信任边界上的校验、防丢数据的错误处理、安全、可访问性，官方明确不在可砍掉的范围里。

## 设计理念

先读改动碰到的代码，顺着真实数据流走一遍，再按梯子往下选：存在与否、仓库里有没有、标准库、平台、已装依赖、能不能一行、最后才是最少能用的代码。阅读在前，选台阶在后。

含糊的请求（「给我做一个 X」）只做能完成核心工作的最小版本。仓库里已有组件时，按周围代码的用法接上去，而不是另起一套。项目自有封装优先于平台控件；已装依赖能解决就用，不为几行代码再加依赖。分支、循环、解析、金钱或安全相关的新逻辑，要留下一个小测试或基于 assert 的自检；琐碎改动不必。已知限度的捷径写成注释：`shortcut: <限度>, <何时升级>`。

强度分三档。`lite`：按要求做，但用一行指出更小的做法，让你选。`full`：上面这套规则，默认。`ultra`：动工前还会顶回需求里站不住的部分。整段会话里一直生效，直到你说 `stop ponytail` 或 `normal mode`。

每条回复末尾会交代跳过了什么、没查什么，以及你必须知道的风险。

## 基本用法

装法见文末链接。只从官方仓库或 `@dietrichgebert/ponytail` 装。下面说装好之后怎么用。

**平时写功能。** 先把强度调到你要的档，或不调（默认 `full`）：

```text
/ponytail
/ponytail lite
/ponytail full
/ponytail ultra
/ponytail off
```

然后照常下任务。官网给过一个对照：「给前端加一个日期选择器。」没有这套规则时，agent 容易手写一整套日历；有它时，会先看仓库里有没有现成的 `Input`，再看浏览器是否自带 `type="date"`，把两者接上。仓库是 React，答案就留在 React 里，日历交给浏览器。

也可以直接把意图写进 prompt，不必先记命令名：

```text
用最简单的做法：给设置页加一个生日日期选择，不要新装日期库。
```

或：

```text
be lazy / yagni：这个列表筛选先别抽通用组件，只改当前页。
```

**改完要人审一遍。** `/ponytail-review` 不只扫 diff。它会读改动碰到的代码：调用方、被调用方、测试、README，再按正确、安全、真实负载、缺测、速度、是否多余这个顺序报。每条会说这段在做什么、会出什么问题、怎么修、不修会怎样。可以收窄范围：

```text
/ponytail-review
/ponytail-review uncommitted
/ponytail-review staged
/ponytail-review branch
/ponytail-review https://github.com/org/repo/pull/123
```

什么都不写时，默认看未提交改动；没有未提交，再看最近一次提交。

**整仓体检。** 同一套检查对准整个仓库，并按该先修什么排序：

```text
/ponytail-audit
```

**捷径别丢在聊天里。** 会话里暂缓的 shortcut，用 `/ponytail-debt` 收成账本，避免「以后再说」变成永远不说。想看官方基准分数板用 `/ponytail-gain`，命令速查用 `/ponytail-help`。

## 仓库与文档

- 官网：[ponytail.dev](https://ponytail.dev)
- 仓库：[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)
- 安装：[INSTALL.md](https://github.com/DietrichGebert/ponytail/blob/master/INSTALL.md)
