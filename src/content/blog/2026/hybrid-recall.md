---
title: 客户端混合召回：词面、向量和小集合重排
tags:
  - AI
  - RAG
  - 检索
category: 技术
hero: ./hybrid-recall-hero.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@etienne_beauregard?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Étienne Beauregard-Riverin</a> on <a href="https://unsplash.com/photos/architectural-photography-of-blue-glass-building-yA-WIoC-wiA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-09-25 13:00:00
---

说到客户端检索，很多人会说：上 embedding 就行了，意思近的句子会靠得更近。是的。不过我最近在一个项目里做的，并不是「整库向量化，再交给大模型挑」。用户用自然语言找历史条目，条数到几千。词面对得上时够用；查询写「失眠」、正文写「睡不着」，字面几乎没交集。把全集丢给大模型「你来挑」，贵，延迟和噪声也难看。

更实际的目标是：先在客户端把候选捞准，必要时再用已有模型对小集合排一次序。

**TL;DR：** 三层——词面打分粗捞、小型多语嵌入做同义召回、再把 top 候选交给已有对话模型短重排。列表型即时搜索只用前两层；可以多等一轮的精准召回才走第三层。嵌入约 140MB、懒加载；挂了就退回词检索。

## 召回停在 retrieve，不必整段 RAG

经典 RAG 是 retrieve → augment → generate。这里的链路可以停在 retrieve，外加可选的 rerank：找到条目即可，不必把结果立刻注入日常生成上下文。

![客户端混合召回主链路](./hybrid-recall-pipeline.png)

同一套混检，按入口分流是否重排。列表搜索按键要跟手；精准召回可以多等一轮。

![同一套混检，两种入口](./hybrid-recall-entry-split.png)

## 词检索没有扔掉

向量不是银弹。日期、专名、奇怪拼写，词面往往更稳。更重要的是需要一条不依赖模型下载的底线。

做法是放宽词面门槛做并集召回，再和向量结果按文档 id 合并。融合前各自归一化，再加权：

```ts
// 示意：0.4 词面 + 0.6 向量
score = 0.4 * (lex / lexMax) + 0.6 * (vec / vecMax)
```

容易踩的坑：若「是否多选」原先按绝对词分写（例如 `b.score >= a.score - 2`），融合分落在 0～1 时这条几乎恒真，结果什么样都变多选。混检要用相对间隙——第二名 ≥ 第一名的 85%，或分差小于某个小数。

词面负责可解释与降级，向量负责同义。两套分数不要共用同一套阈值。

## 嵌入在客户端算，和检索同进程

同义召回需要向量。我们选在客户端用小型多语检索嵌入（例如 `multilingual-e5-small` 的 ONNX q8）现算，而不是每条查询都打远程 embedding API——少一跳延迟，也少把整库正文为了建索引反复上传。首次大约 140MB（权重 + tokenizer），之后由 Transformers.js 一类库缓存。

加载可以很朴素：

1. 应用启动后后台 `warm`，不挡首屏
2. 全局单例 Promise，成功复用；失败打标，不再死磕
3. e5 类模型：查询加 `query:`，文档加 `passage:`
4. 文档截断后嵌入，按 docId 持久化，避免每次全量重算
5. 启动后限并发补齐缺向量的旧文档；删除时清对应向量

代价是首次精准召回可能要等模型——所以列表搜索不等，精准路径才等。几千条文 × 几百维 float，存储上通常只是数兆字节。

## LLM 只做重排，不做全集检索

混检给出小候选集后，才把 query 和截断摘要交给项目里已经在用的对话模型：

- 只许使用给定 id，禁止编造
- 按相关度排序
- 返回置信度：高则直接取 top-1；低或分差近则交给 UI 多选

鉴权与现有对话接口共用即可。重排失败就退回融合分的 single / multi 判定。

模型擅长在小集合里消歧，不擅长在几千条里盲搜。边界划开：检索交给混检，消歧交给 LLM，两边都轻松。

## 降级是一等公民

不必弹「正在下载 140MB 模型」。用户感知的是结果准不准，不是管道有几节。

![降级是一等公民](./hybrid-recall-degrade.png)

## 刻意不做的

每次问答都做全库 RAG 注入——召回与日常生成语境分开，避免随口一问拽进半库历史。上完整向量检索服务——体量只有几千条时，客户端混检够用，不必先上独立检索引擎。列表搜索也打重排——多一次 LLM 会把输入框拖成转圈。

同义靠向量，必要时再加重排；专名、日期、原句拷贝仍更吃词面。这是混合的意义。

## 工程上值得记下的

用 `@huggingface/transformers`（或同类）时：动态 import，仅客户端。Next.js 16 默认 Turbopack：若配置了 `webpack` resolveAlias，需同时给空的 `turbopack: {}`，否则 build 可能直接失败。换的是候选来源与排序；上层「展示单条 / 多选 / miss」可以不动。

对我来说，这套客户端混检对准三件事：同义靠向量，不能只靠 bigram；消歧靠小集合 LLM 重排，不要让模型在全库里盲搜；体验靠分流与降级——列表要快，精准召回要准，坏了还能用。

体量中等、又要一点语义时，不必先上完整 RAG 栈。词 ∪ 向量 ∪ 小集合重排，够用。

## 延伸阅读

- [intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small) — 多语检索嵌入
- [Transformers.js](https://huggingface.co/docs/transformers.js) — 浏览器侧 ONNX 推理
