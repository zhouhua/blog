---
title: streamText 怎么流式吐结构化对象
tags:
  - AI
  - AI SDK
  - TypeScript
category: 技术
hero: ./ai-sdk-partial-output-hero.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@latteinacup?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Latte</a> on <a href="https://unsplash.com/photos/abstract-bokeh-lights-with-fiber-optics-lFzttgxl56A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-09-23 00:30:00
---

说到结构化输出，很多人会想到：给模型一份 schema，等它吐完一整段 JSON，再 `parse`、再校验。是的，能走通。不过字段一多、嵌套一深，界面就只好空着转圈——文字早就在流了，对象却还在等整包到齐。

AI SDK 6 起，这件事收进了 `streamText` 的 `output`。这篇只谈这一条：

`streamText` + `Output.object({ schema })` → `partialOutputStream`

边生成边拿到一份还在变完整的对象。

## `streamObject` 为啥被弃用了

如果你还在用 `streamObject`，迁移指南的对应关系很机械：`schema` 改挂到 `Output.object({ schema })` 上，`partialObjectStream` 改名 `partialOutputStream`，完整结果从 `result.object` 换成 `result.output`。`generateObject` 一样，改走 `generateText` + `Output`。

弃用不是因为流式对象没人要了。官方 PR（[#10754](https://github.com/vercel/ai/pull/10754)）的说法更直：`streamObject` 相对 `streamText` 长期少半截能力，工具调用尤其吃亏。社区 issue 也差不多围着这些转——reasoning、`toDataStreamResponse`、自定义数据、`onChunk`、两边对不齐的 `onFinish`。每补一项，就多维护一条平行 API。

「对象专用入口」听起来干净。可是结构化输出本来就是生成结果的一种形状，不该另起一套生命周期。`streamText` 能接 `output` 之后，再留一个几乎同构、能力却更窄的 `streamObject`，文档和迁移只会一直分叉。

现在的用法是：还走 `streamText`；要什么形状，用 `Output.object` / `array` / `choice` / `json` 说清楚。工具和结构化输出可以塞进同一次请求——旧 API 长期够不着的，正是这个。

## 不接 SDK 时，大家怎么凑合

等完整对象：`generateObject`，或现在的 `generateText` + `Output.object`。类型和校验一次到位，交互上就是提交之后干等。

自己拼流：模型吐文本，前端拼字符串，再反复 `JSON.parse`。半截 JSON 会炸，字段对不上还得自己兜；schema 和 UI 状态各写一套，过两周就漂了。

第二种看起来更「流式」。可你要的通常不是字符串在动，而是对象上已经写稳的字段能先上屏。拼字符串只是手段，校验和类型全推回自己手里。

SDK 现在的做法是：schema 照旧声明；流的过程中给你 deep partial；结束后再给校验过的完整对象。`streamObject` 以前干的就是这个，弃用之后挂到 `streamText` 上了。

## 写法其实就这几行

```ts
import { streamText, Output } from 'ai';
import { z } from 'zod';

const recipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
    }),
  ),
  steps: z.array(z.string()),
});

const { partialOutputStream, output } = streamText({
  model: yourModel,
  output: Output.object({ schema: recipeSchema }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const partial of partialOutputStream) {
  // DeepPartial：字段可能还是 undefined
  console.log(partial?.name, partial?.ingredients?.length);
}

const finalObject = await output; // 完整，且按 schema 校验过
```

`streamText` 还是原来那条生成路径，不是另开一个「只做 object」的门。`Output.object({ schema })` 负责声明最终形状（Zod、Valibot、JSON Schema 都行），完整结果会校验。`partialOutputStream` 则每来一截模型输出，就推一份当前能解析出来的部分对象。

完整结果等 `await output`；过程中看 `partialOutputStream`。后者不会假装已经通过 schema——官方也写了，数据没长齐，没法做完整校验。落到 UI，就是字段可能缺席，别假设 `ingredients[0].amount` 一定在。

## 半截字段比 schema 更早炸

流刚开始可能只有 `{ name: "Las…" }`，过一会儿才有 `ingredients: [{ name: "pasta" }]`，`amount` 还没到。你要是直接 `map` 进表格、不写可选链，运行时错误往往比最终校验失败来得更早。

React 里可以用 `useObject`：schema 前后端共用，拿到的 `object` 同样是 partial，JSX 里照样得 `notification?.name`。服务端还是 `streamText` + `Output.object`，把流交给客户端。

对我来说，值不值得上流式结构化，就看一件事：对象还没长齐时，用户能不能先看见已经稳的那几块。菜名先出来、配料一条条冒——比干等整包 JSON 像样。若下一步是写库、下单、调 API，必须字段全合法，那就别装流式，直接 `generateText` + `Output.object`，等 `output` 过了再往下走。

## `elementStream` 管的是另一层

若要的是一串同类元素，可以用 `Output.array({ element })`，消费 `elementStream`：每冒出一条完整且已校验的元素，推一次。

`partialOutputStream` 推的是整棵树的当前快照，里面可以夹着没写完的字段；`elementStream` 推的是「这一条已经合格，可以单独用」。通知列表、卡片瀑布更适后一种；一张表单、一份嵌套配置更适前一种。

选错会很难看：在 partial 里把半截元素当完成品塞进列表，用户会看到空白行，或者刚出现又改掉的脏数据。

## 错误常常在流里面

`streamText` 一开始就推流。中途出错，经常进流本身，而不是你外面的 `try/catch`。挂个 `onError` 打到监控，再决定 UI 停在最后一份 partial，还是清掉。

完整对象校验失败，是另一类错误（比如 `NoObjectGeneratedError`）。前面渲染过半截，最后 `await output` 仍可能挂——这两件事可以同时发生。产品上得先想好：半截要不要留，能不能标成「未确认」。

对我来说，schema 从来不是难点。难的是半成品能不能安全地出现在界面上，以及哪些字段可以早亮、哪些必须等校验过。

## 延伸阅读

- [Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) — `Output.object` / 流式 structured output
- [Migrate AI SDK 5.x to 6.0](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0) — `streamObject` → `streamText` + `Output`
- [Output](https://ai-sdk.dev/docs/reference/ai-sdk-core/output) — `object` / `array` / `choice` / `json`
- [Object Generation (`useObject`)](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation) — 客户端消费 partial 对象
