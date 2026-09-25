---
title: archify：把系统描述画成可交互的技术图
tags:
  - AI
  - skill
  - 图表
category: 技术
hero: ./archify-hero.png
heroCopyright: Image from <a href="https://tt-a1i.github.io/archify/">Archify</a>
type: post
date: 2026-09-20 09:00:00
---

## 什么是 archify

archify 不是要打开的绘图软件。它是写给 coding agent 的 skill，把系统描述画成可交互的技术图。

给 Cursor、Claude Code、Codex 和 OpenCode 用。一句描述就够，不必先有仓库。交回的是一个 HTML 文件，用浏览器打开。没有服务器，也没有额外依赖。

## 设计理念

图先按问题选类型，不是同一张流程图换个标题。五种类型各管一件事。架构图画组件、服务、存储和它们之间的连接。流程图画参与者、顺序、分支和例外。时序图画谁调用谁、按什么顺序、返回什么。数据流图画数据从哪来、经过什么变换、到谁手里。生命周期图画状态、等待、重试和结束。

视觉有四种预设：Classic、Signal Flow、Blueprint、Editorial。几何是同一套，深色和浅色一起切换。组件按角色上色，例如前端、后端、数据库、云、安全、消息和外部，深浅各有一套。

交互停在已经写明的路径上。可以检视某一站，也可以沿一条写好的关系走一遍。可以钉住某一个节点，把链接发给别人打开同一处。不在播放时另造连接。

导出有 PNG、JPEG、WebP、SVG 和 WebM。位图在浏览器里按最高四倍分辨率绘制。SVG 带深浅两套，随读者的主题切换。一个 HTML 文件就能分享。

## 基本用法

安装：

```bash
npx skills add tt-a1i/archify -g
```

先装上。再描述组件、连接和外部服务，或让 agent 先看仓库。最后让 agent 用 archify 画出来。得到的 HTML 用浏览器打开，再用对话改，例如加上一个缓存，或把认证挪到左边。

## 仓库与文档

- 说明：[Archify](https://tt-a1i.github.io/archify/)
- 仓库：[tt-a1i/archify](https://github.com/tt-a1i/archify)
