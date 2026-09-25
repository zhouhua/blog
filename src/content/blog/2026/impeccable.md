---
title: impeccable：给 agent 的设计词汇
tags:
  - AI
  - skill
  - 设计
category: 技术
hero: ./impeccable-hero.png
heroCopyright: Image from <a href="https://impeccable.style/">Impeccable</a>
type: post
date: 2026-09-19 23:20:00
---

## 什么是 impeccable

impeccable 不是组件库，也不是配色包。它是给 agent 的设计词汇，让 agent 从零做界面、改已有的界面，并守住项目里已有的设计系统。

## 设计理念

先说要改什么。它再把设计判断补上。

有 61 项检查，拦住 agent 默认会做成的样子，不让这些样子变成这个产品的设计。

设计方向是人工审过的，每一套有自己的视觉规则。它把这些方向和产品本身的想法放在一起看，再围绕最合适的一套来做。已有的颜色、组件和规则要沿用，新页面应该像同一个产品。

用户和他们的目标写进 `PRODUCT.md`，做设计之前先读。`/impeccable document` 把现有的视觉系统写成 `DESIGN.md`，下一次做功能或换一个 agent 时还能用。

按手头的任务来设计。落地页要帮人做决定，后台要帮人把事情做完。页面上分成说服、操作、阅读和体验。

agent 改界面时，设计钩子在代码里检查这次改动，把问题送回去。这一步不调用模型，也不要 API key。

## 基本用法

两步装好，然后直接说要做或要改什么。

```bash
npx impeccable install
```

然后在工具里运行 `/impeccable init`。站点推荐用这个安装器，它会按所用工具放好文件和集成。也可以用 `npx skills add pbakaus/impeccable` 安装共享的 skill。

`/impeccable polish` 在已有设计系统里收一遍，再跑检查。例如定价页：保留锐利的转角和克制的配色，去掉 AI 的痕迹。`/impeccable typeset` 管文字，让标题更清楚，字号和行长更适合读。`/impeccable live` 对着正在跑的页面改，可以点选元素，也可以对整页下指令。`/impeccable document` 写出 `DESIGN.md`。

## 仓库与文档

- 说明：[Impeccable](https://impeccable.style/)
- 仓库：[pbakaus/impeccable](https://github.com/pbakaus/impeccable)
