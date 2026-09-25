---
title: Superpowers：一套软件开发方法
tags:
  - AI
  - skill
  - 工作流
category: 技术
hero: ./superpowers-cover-v2.png
type: post
date: 2026-09-19 00:30:00
---

## 什么是 Superpowers

[Superpowers](https://github.com/obra/superpowers) 不是某一个命令，也不是写进项目仓库的一层目录。它是装在 coding agent 上的一套软件开发方法：若干可以组合的 skill，加上一段初始说明，让 agent 在该用它们的时候真的去用。

你要求 agent 做一个功能，常见做法是直接修改文件。装上 Superpowers 之后，它会先退后一步，问你真正要做成什么，再把规格从对话里收出来。

## 设计理念

规格不整篇抛出。它分成短到可以读完的段落，给你确认。你点头之后，才写实施计划。计划要具体到这种程度：一个没有项目上下文、判断力有限、也不愿写测试的人，仍能照着做。

实现遵循三件事。先写会失败的测试，看到失败，再写刚好让测试通过的代码，然后整理。不提前做现在用不上的部分。重复的逻辑收成一处。

这些 skill 按情境自己触发。你不需要记住先调用哪一个。

## 基本用法

一次完整的开发按这个顺序走。

brainstorming 在写代码之前触发。它用问题把粗略的想法收成设计，分段给你确认，并把设计文档存下来。

设计通过之后，using-git-worktrees 在新分支上建立隔离的工作区，跑项目自身的准备步骤，并确认测试基线是干净的。

writing-plans 把工作拆成很小的任务。每一项都有明确的文件路径、实现内容和验证步骤。

计划就绪之后，有两条执行路径。subagent-driven-development 为每个任务派出一个新的 subagent，先检查是否符合规格，再检查代码质量。executing-plans 分批执行，中间留有人工检查点。你明确说开始，它才按计划往下做。

实现过程中，test-driven-development 约束顺序：先写失败的测试，看到它失败，再写最少的代码让它通过。

安装方式按工具区分。已经在一个工具里装过，换到另一个工具仍要再装一次。在 Cursor 的 Agent 对话中，可以输入 `/add-plugin superpowers`，或在插件市场搜索 superpowers。

## 仓库与文档

- 仓库：[obra/superpowers](https://github.com/obra/superpowers)
