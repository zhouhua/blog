---
title: ui-ux-pro-max：做界面时查的设计资料
tags:
  - AI
  - skill
  - 设计
category: 技术
hero: ./ui-ux-pro-max-hero.png
heroCopyright: Image from <a href="https://www.uupm.cc/">UI/UX Pro Max</a>
type: post
date: 2026-09-19 23:00:00
---

## 什么是 ui-ux-pro-max

ui-ux-pro-max 不是要装进项目的组件库。它是一份可检索的设计资料：界面风格、配色、字体搭配、图表类型、落地页结构和交互规则。做界面时先查，再让 agent 按查到的结果写。

资料按这几类收着：57 种界面风格，95 套配色，56 组字体，24 种图表，29 种落地页结构，以及 8 个技术栈上的写法。风格里包括玻璃拟态、新拟态、极简、粗野主义和极光界面。配色按产品来分，例如 SaaS、电商、医疗和金融，每套都给出主色、辅色、按钮色、背景、文字和边框。字体走 Google Fonts，并配有 Tailwind 写法。图表会注明适合的库，例如 Chart.js、Recharts、D3.js，并带无障碍方面的注意点。

8 个技术栈是 React、Next.js、Vue、Svelte、SwiftUI、React Native、Flutter 和 Tailwind。每个栈有自己的模式和示例，不是同一份建议换个名字。

## 设计理念

一次查询会同时查产品类型、风格、字体、颜色、落地页和交互规则，而不是只挑一个好看的颜色。推荐要落到这个产品上。宠物美容的落地页和金融后台不会共用一套结果。

写完之后还有一张质量清单：用 SVG 图标，不用 emoji 当图标；可点击的地方要有悬停反馈；深色模式要过得了对比度；布局要能随宽度变化。交互规则覆盖动效、无障碍、层叠顺序和加载状态。这些是检查项，不是装饰。

## 基本用法

从一句需求开始。例如：「给宠物美容做落地页，风格活泼、友好，要有预约按钮。」

agent 先把这句话拆开：产品是宠物服务，风格是活泼、友好，页面是落地页，行动是预约。然后到资料库里检索。一次结果里会有产品类型、风格、字体组合、落地页结构、一条交互规则，以及主色、辅色、按钮色和文字色。

检索之后才生成页面。生成完按那张质量清单看一遍，再给出成品。查到的是建议和色值，不是已经写好的页面。不要把检索结果原样贴进仓库。

## 仓库与文档

- 说明：[UI/UX Pro Max](https://www.uupm.cc/)
- 仓库：[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
