#!/usr/bin/env python3
"""Generate a print-ready HTML for Octalysis blog PDF."""

from pathlib import Path

OUT = Path(__file__).resolve().parent
IMG = OUT / "img"


def img(name: str, alt: str = "", cls: str = "") -> str:
    src = f"img/{name}"
    c = f' class="{cls}"' if cls else ""
    return f'<img src="{src}" alt="{alt}"{c} />'


html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>Octalysis 游戏化框架理论</title>
<style>
  @font-face {{
    font-family: "LXGW Bright GB";
    src: url("file:///Users/zhouhua/Library/Fonts/LXGWBrightGB-Regular.ttf") format("truetype");
    font-weight: 400;
    font-style: normal;
  }}
  @font-face {{
    font-family: "LXGW Bright GB";
    src: url("file:///Users/zhouhua/Library/Fonts/LXGWBrightGB-Medium.ttf") format("truetype");
    font-weight: 600;
    font-style: normal;
  }}
  @font-face {{
    font-family: "LXGW Bright GB";
    src: url("file:///Users/zhouhua/Library/Fonts/LXGWBrightGB-Light.ttf") format("truetype");
    font-weight: 300;
    font-style: normal;
  }}

  :root {{
    --ink: #15262f;
    --ink-soft: #3d5160;
    --muted: #6a7d8a;
    --paper: #ffffff;
    --card: #ffffff;
    --line: #d4dde4;
    --teal: #0b6e75;
    --teal-deep: #084e54;
    --teal-soft: #e3f2f3;
    --coral: #c24b3a;
    --coral-soft: #f8ebe8;
    --gold: #9a6b1f;
    --gold-soft: #f7f0e2;
    --radius: 10px;
  }}

  * {{ box-sizing: border-box; }}

  @page {{
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }}

  html, body {{
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: var(--ink);
    font-family: "LXGW Bright GB", "Songti SC", "PingFang SC", serif;
    font-size: 11pt;
    line-height: 1.8;
    font-weight: 400;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .page {{
    max-width: 178mm;
    margin: 0 auto;
  }}

  /* Page 1: title + TOC only */
  .front {{
    min-height: auto;
    display: block;
    page-break-after: always;
    padding: 12mm 0 8mm;
  }}
  .masthead {{
    page-break-after: avoid;
    padding: 0 0 14mm;
    margin-bottom: 10mm;
    border-bottom: 2px solid var(--teal);
  }}
  .masthead-eyebrow {{
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--teal);
    font-size: 9.5pt;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }}
  .masthead-eyebrow::before {{
    content: "";
    width: 22px;
    height: 2.5px;
    background: var(--teal);
    border-radius: 2px;
  }}
  .masthead h1 {{
    font-size: 28pt;
    line-height: 1.3;
    font-weight: 600;
    margin: 0 0 16px;
    color: var(--ink);
    letter-spacing: 0.01em;
  }}
  .masthead-sub {{
    font-size: 12pt;
    color: var(--ink-soft);
    margin: 0;
    font-weight: 300;
    line-height: 1.75;
    max-width: 34em;
  }}
  .masthead-meta {{
    margin-top: 18px;
    font-size: 9.5pt;
    color: var(--muted);
    letter-spacing: 0.02em;
  }}

  .toc {{
    page-break-after: avoid;
    padding: 0;
    margin: 0;
    border-bottom: none;
  }}
  .toc h2 {{
    font-size: 14pt;
    margin: 0 0 18px;
    color: var(--teal-deep);
    border-bottom: none;
    padding-bottom: 0;
  }}
  .toc ol {{
    list-style: none;
    padding: 0;
    margin: 0;
    columns: 1;
    counter-reset: toc;
  }}
  .toc li {{
    counter-increment: toc;
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px dashed var(--line);
    font-size: 12pt;
    break-inside: avoid;
  }}
  .toc li:last-child {{
    border-bottom: none;
  }}
  .toc li::before {{
    content: counter(toc, decimal-leading-zero);
    color: var(--teal);
    font-weight: 600;
    font-size: 10.5pt;
    min-width: 1.8em;
  }}
  .toc .dot {{
    flex: 1;
    border-bottom: 1px dotted #c5d0d8;
    margin: 0 4px 5px;
    opacity: 0.8;
  }}
  .toc .sec {{ color: var(--muted); font-size: 9.5pt; }}

  /* Body from page 2 */
  article {{
    page-break-before: always;
  }}
  h2 {{
    font-size: 16pt;
    font-weight: 600;
    color: var(--teal-deep);
    margin: 22px 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--teal);
    page-break-after: avoid;
  }}
  article > h2:first-child {{
    margin-top: 0;
  }}
  h3 {{
    font-size: 13.5pt;
    font-weight: 600;
    color: var(--ink);
    margin: 20px 0 10px;
    page-break-after: avoid;
  }}
  h4 {{
    font-size: 12pt;
    font-weight: 600;
    color: var(--teal);
    margin: 18px 0 10px;
    page-break-after: avoid;
  }}
  p {{
    margin: 0 0 12px;
    text-align: justify;
    orphans: 3;
    widows: 3;
  }}
  ul, ol {{
    margin: 0 0 14px;
    padding-left: 1.35em;
  }}
  li {{
    margin-bottom: 5px;
  }}
  a {{
    color: var(--teal);
    text-decoration: none;
    border-bottom: 1px solid rgba(11, 110, 117, 0.35);
  }}
  strong {{ font-weight: 600; color: var(--ink); }}
  hr {{
    border: none;
    border-top: 1px solid var(--line);
    margin: 20px 0;
  }}
  blockquote {{
    margin: 16px 0;
    padding: 12px 16px;
    background: var(--gold-soft);
    border-left: 3px solid var(--gold);
    color: var(--ink-soft);
    font-size: 11pt;
    border-radius: 0 var(--radius) var(--radius) 0;
  }}
  blockquote p {{ margin: 0; }}

  .formula {{
    text-align: center;
    margin: 16px 0;
    padding: 14px 12px;
    background: linear-gradient(135deg, var(--teal-soft), #eef6f8);
    border: 1px solid #c5dde0;
    border-radius: var(--radius);
    font-size: 13pt;
    font-weight: 600;
    color: var(--teal-deep);
    letter-spacing: 0.04em;
  }}
  .formula .legend {{
    margin-top: 6px;
    font-size: 9.5pt;
    font-weight: 400;
    color: var(--muted);
    letter-spacing: 0;
  }}

  .callout {{
    background: var(--coral-soft);
    border: 1px solid #e8cfc8;
    border-radius: var(--radius);
    padding: 12px 14px;
    margin: 14px 0;
    page-break-inside: avoid;
  }}
  .callout.tip {{
    background: var(--teal-soft);
    border-color: #c5dde0;
  }}
  .callout.note {{
    background: var(--gold-soft);
    border-color: #e6d7b5;
  }}
  .callout h5 {{
    margin: 0 0 6px;
    font-size: 11pt;
    color: var(--coral);
  }}
  .callout.tip h5 {{ color: var(--teal-deep); }}
  .callout.note h5 {{ color: var(--gold); }}
  .callout p, .callout ul {{ margin-bottom: 0; }}

  .compare {{
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: stretch;
    margin: 16px 0;
    page-break-inside: avoid;
  }}
  .compare-card {{
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 14px 16px;
  }}
  .compare-card h5 {{
    margin: 0 0 8px;
    font-size: 11pt;
  }}
  .compare-card.left h5 {{ color: var(--ink-soft); }}
  .compare-card.right h5 {{ color: var(--coral); }}
  .compare-card ul {{ margin: 0; padding-left: 1.1em; font-size: 10.5pt; }}
  .compare-vs {{
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  .compare-vs img {{
    width: 42px;
    height: auto;
    opacity: 0.85;
  }}

  .img-row {{
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: flex-start;
    margin: 14px 0 16px;
    page-break-inside: avoid;
  }}
  .img-row img {{
    border-radius: 8px;
    box-shadow: 0 3px 12px rgba(21, 38, 47, 0.07);
    border: 1px solid var(--line);
    background: #fff;
  }}
  .img-row.phones img {{
    width: 24%;
    max-width: 120px;
    max-height: 210px;
    height: auto;
    object-fit: contain;
  }}
  .img-row.phones-4 img {{
    width: 20%;
    max-width: 100px;
    max-height: 190px;
    object-fit: contain;
  }}
  .img-row.pair img {{
    width: 46%;
    max-width: 280px;
    max-height: 180px;
    height: auto;
    object-fit: contain;
  }}
  .img-row.pair-uneven {{
    align-items: center;
  }}
  .img-row.pair-uneven img.wide {{
    width: 44%;
    max-width: 260px;
    max-height: 200px;
    object-fit: contain;
  }}
  .img-row.pair-uneven img.narrow {{
    width: 30%;
    max-width: 170px;
    max-height: 200px;
    object-fit: contain;
  }}

  figure.hero-fig {{
    margin: 16px 0 18px;
    page-break-inside: avoid;
  }}
  figure.hero-fig img {{
    width: 92%;
    max-width: 460px;
    max-height: 280px;
    height: auto;
    margin: 0 auto;
    border-radius: 10px;
    border: 1px solid var(--line);
    box-shadow: 0 4px 14px rgba(21, 38, 47, 0.07);
    display: block;
    object-fit: contain;
  }}
  figcaption {{
    text-align: center;
    font-size: 9pt;
    color: var(--muted);
    margin-top: 8px;
  }}

  .split {{
    display: grid;
    grid-template-columns: 1fr 1.35fr;
    gap: 16px;
    align-items: start;
    margin: 14px 0;
    page-break-inside: avoid;
  }}
  .split.reverse {{
    grid-template-columns: 1.1fr 1.4fr;
  }}
  .split img {{
    width: 100%;
    height: auto;
    max-height: 190px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: #fff;
  }}
  .split .text {{ font-size: 10.5pt; }}

  .feature-block {{
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 14px 16px 12px;
    margin: 14px 0 16px;
    page-break-inside: auto;
  }}
  .feature-block .img-row {{
    page-break-inside: avoid;
  }}
  .feature-block > p:first-child,
  .feature-block > .lead {{
    margin-bottom: 10px;
  }}
  .feature-block .lead strong {{
    color: var(--teal-deep);
  }}

  .two-col {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin: 14px 0;
    page-break-inside: avoid;
  }}
  .panel {{
    background: transparent;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 14px 16px;
  }}
  .panel h4 {{
    margin-top: 0;
    font-size: 11.5pt;
  }}
  .panel.left-brain {{
    border-top: 3px solid var(--teal);
  }}
  .panel.right-brain {{
    border-top: 3px solid var(--coral);
  }}
  .panel.white-hat {{
    border-top: 3px solid #5a8f6a;
    background: transparent;
  }}
  .panel.black-hat {{
    border-top: 3px solid #5c4a6e;
    background: transparent;
  }}

  .drive-num {{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    background: var(--teal);
    color: #fff;
    font-size: 9pt;
    font-weight: 600;
    margin-right: 6px;
    vertical-align: middle;
  }}

  .footer-note {{
    margin-top: 20px;
    padding: 14px 16px;
    background: var(--teal-soft);
    border-radius: var(--radius);
    font-size: 10.5pt;
    color: var(--ink-soft);
  }}
  .footer-note h3 {{
    margin-top: 0;
    color: var(--teal-deep);
    font-size: 12pt;
  }}

  @media print {{
    a {{ border-bottom: none; color: var(--teal-deep); }}
    html, body {{ background: #ffffff; }}
  }}
</style>
</head>
<body>
<div class="page">

<!-- PAGE 1: Title + TOC only -->
<section class="front">
<header class="masthead">
  <div class="masthead-eyebrow">Product Design · Gamification</div>
  <h1>Octalysis 游戏化框架理论</h1>
  <p class="masthead-sub">从游戏中提取引人入胜的元素，理解八大核心驱动力，系统化地设计用户行为与长期参与。</p>
  <div class="masthead-meta">产品思维 · 游戏化 · 2023.04 · 基于 Yu-kai Chou 的 Octalysis 框架整理</div>
</header>

<section class="toc">
  <h2>目录</h2>
  <ol>
    <li>什么是游戏化 <span class="dot"></span> <span class="sec">传统 vs 游戏化</span></li>
    <li>Octalysis 框架概览 <span class="dot"></span> <span class="sec">八边形 · 驱动力</span></li>
    <li>八大核心驱动力详解 <span class="dot"></span> <span class="sec">使命 · 成就 · …</span></li>
    <li>左脑与右脑核心驱动 <span class="dot"></span> <span class="sec">外在 vs 内在</span></li>
    <li>白帽与黑帽核心驱动 <span class="dot"></span> <span class="sec">充实 vs 紧迫</span></li>
    <li>延伸话题 <span class="dot"></span> <span class="sec">角色 · 阶段 · 分析</span></li>
  </ol>
</section>
</section>

<!-- CONTENT from page 2 -->
<article>

<h2>什么是游戏化</h2>
<p>游戏化是指提取游戏中的那些引人入胜、令人着迷的元素，并应用到现实世界或产品设计的一种方法。</p>

<div class="compare">
  <div class="compare-card left">
    <h5>📖 传统产品设计</h5>
    <ul>
      <li>以功能为中心</li>
      <li>关注用户场景，注重效率</li>
    </ul>
  </div>
  <div class="compare-vs">{img("Untitled.jpg", "对比", "")}</div>
  <div class="compare-card right">
    <h5>💥 游戏化产品设计</h5>
    <ul>
      <li>以人的行为为中心</li>
      <li>关注动机，并进行设计</li>
    </ul>
  </div>
</div>

<div class="img-row pair">
  {img("Untitled1.jpg", "矿工体验 A", "")}
  {img("Untitled2.jpg", "矿工体验 B", "")}
</div>
<blockquote><p>你想体验哪种矿工？</p></blockquote>

<p>游戏实际上是为了取悦玩家而存在，但也因此，经过几十年的发展，游戏行业是最能掌握「以人为本」的设计理念的行业，比如人的行为动机、心理感受、参与感。</p>
<p>要进行游戏化产品设计就要求我们先能搞清楚为什么游戏能吸引人，进而探索如何把这些吸引人的特质应用在现实场景中。</p>

<h3>行为模型</h3>
<div class="formula">
  B = M · A · T
  <div class="legend">B: behavior　M: motivation　A: ability　T: triggers</div>
</div>
<p>这是由福格提出的行为模型，即人的行为是由动机、能力、触发器三个要素组成，只有这三者都具备，行为才会发生。能力很好理解，一个人要做某种行为，前提是自己有能力做。动机是一个人做某件事的强烈意愿，是一种内在动力。我们在讲游戏化产品设计时，就是在对用户行为动机在进行设计，希望用户自发地进行我们期望的产品动作。如果有动机，有能力，那么在某些信号的触发下，人们就可能做出特定的行为，比如我突然想吃 KFC，也买得起，那么也许某个周四的中午，在疯狂星期四的活动驱使下，我就会去吃 KFC。</p>

<hr />

<h2>Octalysis</h2>
<p>原先在教育部门，我们想提升小朋友学习的兴趣，提升各个功能的使用渗透和活跃，专门成立一个部门运用游戏化的手段，在产品中引入游戏元素或改造现有功能，也是从那时起，我接触到了 Octalysis 的概念。</p>
<p>Octalysis 是一种游戏化产品设计的理论框架，由 <a href="https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/">Yu-kai Chou</a> 创造。本文的很多概念和观点整理自 Yu-kai Chou 的文章和演讲。</p>
<div class="formula">
  Octagon + Analysis ⇒ Octalysis
</div>
<p>回到 <strong>Octalysis</strong> 这个词，它是一个人造词，由 Octagon 和 Analysis 两个词拼起来的。</p>

<figure class="hero-fig">
  {img("Untitled3.jpg", "Octalysis 八大核心驱动力", "")}
  <figcaption>八种核心驱动力构成八边形（Octagon），用于分析与设计游戏化体验</figcaption>
</figure>

<p>Octalysis 引入了「核心驱动力」的概念来归纳人们的行为动机，如上图所示，一共抽象了八种核心驱动力，形成了这样的八边形（Octagon shape）。基于这八种核心驱动力，我们可以进一步分析（Analysis）产品现状、设计游戏化体验。</p>

<h3>核心驱动力</h3>

<h4><span class="drive-num">1</span>使命召唤（Epic Meaning &amp; Calling）</h4>
<p>美德、道义、信仰、责任等等，一个普通人在这些主题面前，自己反而显得微不足道。没有什么比让人觉得自己参与了一个无比伟大、荣耀的事业中更令人斗志昂扬了，这就是一种使命感。身处其中的人们，被自己深深认同的使命所召唤，也许自己并不能从中获得实质的好处，但却乐此不疲。</p>
<p>这项核心驱动力在我们的生活中随处可见：</p>
<ul>
  <li>维护开源项目</li>
  <li>参与公益活动（跳跳糖）</li>
  <li>撰写维基百科词条</li>
  <li>品牌信仰，出新品就买</li>
  <li>见义勇为，甚至为民族、为家国而牺牲……</li>
</ul>
<p>如果我们的产品中能够让用户感受到自己成为某个伟大项目的一部分时，可以是我们的愿景或理念、激动人心的用户故事、活跃社群等等，这项核心驱动力可能被激活。被「使命召唤」所驱动的用户会表现出更强的积极性，他们更愿意推广你的产品，更不在意金钱和精力的投入，有时候甚至会达到非理性的程度。</p>
<p>使命召唤这种驱动力当然适用于产品的全部生命周期，但最常在用户刚接触产品时引入（discovery &amp; on-boarding phase）。比如对我而言，字节范在我刚入职前几周的时间里带给了我最多触动。</p>
<p>接下来看看我们如何在产品中引入这种核心驱动力：</p>

<div class="feature-block">
  <p class="lead"><strong>讲故事</strong> — 这是游戏中最常用的手段，在游戏的一开始就营造一个世界观，谁能拒绝去拯救世界、营救公主、打败魔王、寻找宝藏，或是帮鳄鱼洗澡。在游戏之外，在任何产品设计中，会讲故事都是很有用的，可能可以让一件枯燥的、不感兴趣的事情变得不一样。</p>
  <div class="img-row phones">
    {img("Untitled4.jpg", "讲故事示例 1", "")}
    {img("Untitled5.jpg", "讲故事示例 2", "")}
    {img("Untitled6.jpg", "讲故事示例 3", "")}
  </div>
</div>

<div class="feature-block">
  <p class="lead"><strong>人性光辉</strong> — 帮助陌生人，参与慈善，对于很多人来说是非常崇高的使命。</p>
  <div class="img-row phones">
    {img("Untitled7.jpg", "人性光辉 1", "")}
    {img("Untitled8.jpg", "人性光辉 2", "")}
    {img("Untitled9.jpg", "人性光辉 3", "")}
  </div>
</div>

<div class="feature-block">
  <p class="lead"><strong>新手运</strong> — 如果一个人第一次坐上德州扑克的牌桌，是一手好牌能让他愿意继续玩下去，还是输个精光能让他继续玩下去。游戏中不光会给玩家一个世界观，一个出去冒险的理由，同时也会营造出非你不可的感觉，在游戏中，你不是一个普通人，而是被选中的人（超能力、强大的装备等等）。那么在现实场景中，像新人礼包、生日优惠等等已经被应用得很成熟了。</p>
  <div class="img-row pair-uneven">
    {img("Untitled10.jpg", "新手运 1", "narrow")}
    {img("Untitled11.jpg", "新手运 2", "wide")}
  </div>
</div>

<div class="callout">
  <h5>💊 设计提示</h5>
  <p>可信度是关键，意义太大，而故事太小，只会让人觉得荒谬。</p>
</div>

<h4><span class="drive-num">2</span>成长与成就（Development &amp; Accomplishment）</h4>
<p>人们常常会被成就感驱使着，朝着一个目标不断前进。</p>
<p>幼儿园的小朋友很在意自己被老师奖励了几个小星星、小红花，尽管这并不是什么实质的奖品；游客在景区拿着「旅游护照」在各个景点穿梭，敲章打卡。这些都能带来成就感。而在游戏中，成就感就被设计得更全面了——积分、徽章、排行榜、进度条、章节、等级、更好的装备等等。</p>
<p>游戏中，玩家体验到的是通往胜利的过程中，角色在不断成长的乐趣，整个流程分成无数的阶段、里程碑、关卡等等，成就点非常密集。当好不容易打败一个怪物正兴奋时，角色经验值也积攒得很快能再长一级；等升完这一级后，很快也能收集齐任务所需要的道具……</p>

<div class="split">
  {img("Untitled12.jpg", "沙漠巴士", "")}
  <div class="callout note">
    <h5>🗒️ 极端的反面例子</h5>
    <p>1995 · DC · 《沙漠巴士》</p>
  </div>
</div>

<div class="callout tip">
  <h5>💊 关键洞察</h5>
  <p>成就感的获得不仅仅来源于看到了某个目标的进展，更在于这个过程中的挑战。</p>
</div>

<p>人为的挑战和限制是游戏最有趣的地方。设想一下，如果高尔夫球的规则和限制都取消了，只要把球放到小洞里就能得分，那么这个运动还会有人玩吗？让人们感到兴奋的不在于达成目标，而在于克服了困难达成了目标，我们在产品的设计中不妨记住这点。</p>
<p>不光在游戏中，在产品设计中成长与成就这一核心驱动力也是最容易被设计的，也是最常被应用的。我们不妨稍加展开，谈谈一些常见的应用及存在的问题。</p>

<div class="feature-block">
  <p class="lead"><strong>进度条</strong> — 进度条应用非常广泛，它激励着人们想办法促使看到的进度条完整。</p>
  <div class="img-row phones-4">
    {img("Untitled13.jpg", "进度条 1", "")}
    {img("Untitled14.jpg", "进度条 2", "")}
    {img("Untitled15.jpg", "进度条 3", "")}
    {img("Untitled16.jpg", "进度条 4", "")}
  </div>
  <p>第一张图是我非常喜欢的一个问卷工具 Typeform 做出来的问卷，问卷的最上方是一个进度条，当完成了一道枯燥的问卷问题后，相应地会有进度的更新反馈，让人直观地觉得离完成又近了一步。早年间 LinkedIn 在用户信息填写页面增加了一个进度条提示，从而让用户信息完整度提升了 55%。在第二张图中可以看出，脉脉也引入了类似的设计。进度条的另一广泛应用在于会员的成长体系，通过进度条直观地感受到自己距离下个级别还有多远，可以如何努力。</p>
</div>

<div class="feature-block">
  <div class="split reverse">
    {img("Untitled17.jpg", "徽章系统", "")}
    <div class="text">
      <p class="lead"><strong>徽章与成就系统</strong></p>
      <p>成就系统几乎也已成为互联网产品的标配，通过发放徽章、徽章的升级等来激励用户使用产品。</p>
      <p>成就系统的核心在于「成就」而不是「徽章」。如果你设计出来的徽章并不能代表成就，那么这将让人觉得很愚蠢。徽章象征的一定是用户经过了某种努力而达成的一些目标，这才会让人有成就感，否则甚至会被污辱的感觉。</p>
      <p>不过请注意，同一个目标对于不同的人来说，感受是不同的。对于成年人的产品，也许交 5 个朋友根本不值一提，可如果是小孩子的产品，也许意义大不一样。</p>
    </div>
  </div>
</div>

<div class="feature-block">
  <p class="lead"><strong>排行榜</strong> — 排行榜的目标是激励用户取得更好的排名，但如今很多产品会把排行榜做得很精细。当一个新用户进入到一个 App 中时，他的积分排名在第 100 万名，请问他会有动力把自己的排名提升到前 10 万名吗？未必，这个排名对于他已经毫无意义了。</p>
  <div class="img-row phones">
    {img("Untitled18.jpg", "排行榜 1", "")}
    {img("Untitled19.jpg", "排行榜 2", "")}
    {img("Untitled20.jpg", "排行榜 3", "")}
  </div>
  <p>抛弃总榜、拆分小榜是趋势。网易云音乐从各种维度拆出小榜；大众点评按地区与品类细分。如果有音乐人或者餐厅想要提升自己的排名，提升路径其实非常明确，只需与有限的对手竞争。另一种做法类似于微信读书、微信运动：用户只与自己的好友对比，每个人看到的排行榜都不一样，同时还能兼顾社交需求。</p>
</div>

<h4><span class="drive-num">3</span>创意赋能（Empowerment of Creativity &amp; Feedback）</h4>
<p>有时候我们评价游戏，会用「可玩性」这个词，那么可玩性从何而来？通俗来说，可以这么玩，也可以那么玩，就是可玩性（比如五子棋与围棋的对比）。在游戏机制和设定之下，越是能让玩家有探索和创造的空间，也越能带来快乐和满足感。满足这个特征的游戏它们的生命力会特别顽强，经久不衰。</p>
<p>还记得在谈及「使命召唤」时，曾介绍说这项核心驱动力常常在用户刚接触游戏/产品时引入；而「创意赋能」则不同，更强调「终局」的感受，让人不愿离开，或想再次体验。很多游戏在玩家玩过一阵子之后就再也不玩了，但像积木、画画、扑克、篮球、麻将，这些游戏和运动却能一直经历时间的考验，依然受欢迎。</p>
<p>「创意赋能」在八个核心驱动力中的位置非常重要，它既是代表长期积极的情绪（白帽核心驱动），又是强调内在的动力（右脑核心驱动），然而要想正确地设计和实现这个核心驱动力，却是最难的。</p>
<ul>
  <li><strong>助推器</strong> — 游戏里有很多道具，可以帮助玩家提升能力，降低挑战的难度，比如马里奥里无敌的星星。这些可以看作是助推器，帮助玩家更容易获得胜利，但并不是绝对，依然需要玩家自己的努力，同时助推的过程是短暂的，很快就会失效了。我们在大力台灯中设计了一个功能，提供一种特殊的描红机制，让小朋友更容易画出好看的画。剪映之于抖音可能也有类似的作用，它让抖音视频的创作变得简单，激发用户的创作热情。</li>
  <li><strong>里程碑解锁</strong> — 很多游戏中都有升到某个等级才能解锁某个技能，比如植物大战僵尸，完成了一关后可能得到了一个全新的植物，还不知道这个植物怎么玩呢，不如再玩一关体验一下吧。在成长与成就中我举过会员等级的例子，当你的会员等级又升了一级，获得了新的会员权益，你确定不要去体验一下？</li>
  <li><strong>（虚假的）选择权</strong> — 如果想培养小孩学习乐器，直接强迫他学习，很可能会有逆反心理；可如果一开始就给他一个选择：「你最想学什么乐器？」就会好很多。对于小孩来说，这个选择是没有意义的，因为不管选什么，都达成了父母的期望：学乐器。但这一招在成人世界并不一定管用。最直观的例子是价格锚定：一个汉堡 20 块，包含相同汉堡以及薯条、可乐的套餐只要 22 块，你选哪个？</li>
</ul>

<h4><span class="drive-num">4</span>所有权（Ownership &amp; Possession）</h4>
<p>当你拥有一件东西的时候，你会想改进它、保护它，并获得更多，所有权这种核心驱动力正是基于这种心理而产生的。在游戏中，这通常与虚拟商品、虚拟货币等元素相关。不过更进一步讲，只要是自己花费了很长时间定制的（avatar），或者一个系统一直在了解自己的偏好并塑造成独特的东西（抖音），你都会产生对它的所有权。工作中我们也常说 owner 意识，就是把一件抽象的事情当成是自己的，从而更愿意主动地让它变得更好，哪怕付出更多的精力和时间。</p>
<ul>
  <li><strong>从头构建</strong> — 也许只有花费数十小时完成的高达模型拼贴的人才会真的珍视它。宜家家具真的好吗？也许大家更享受自己动手搭建时的那份归属感。</li>
  <li><strong>收集系统</strong> — 游戏里与成就系统并行的通常还有一个收集系统（图鉴、日志等等）。生活中，像拼命吃小浣熊干脆面来收集水浒卡片、买盲盒集齐全套等等，收集系统的特点是一套东西中，有些比较容易收集到，有些却很难，需要花费很多时间和精力，甚至金钱。</li>
</ul>

<h4><span class="drive-num">5</span>社交影响（Social Influence &amp; Relatedness）</h4>
<p>社交影响这项核心驱动力来源于人们普遍的、不可避免的相互联系、相互比较的愿望。现在所有的产品都很注重社交关系，无处不在的「分享」「点赞」「邀请好友」「助力」充斥着手机屏幕，这些大家都很熟悉，我也不展开讲了。还有一些产品形态本身就基于群体用户、社区社群而建立，例如团购、众筹等等。</p>
<div class="split">
  <div class="text">
    <p><strong>导师制</strong> — 想必大家入职的时候都会有一个相对资深的同事作为 mentor 来带领我们熟悉公司和业务，这其实能带来很多好处，比如新人的感受更好、企业文化的得到传承等等。导师的关系也能应用在产品设计中吗？抛开知乎、小红书这类问答或分享的社区不谈，在电商网站中就有很多实践：</p>
  </div>
  {img("Untitled21.jpg", "导师制示例", "")}
</div>

<h4><span class="drive-num">6</span>稀缺（Scarcity &amp; Impatience）</h4>
<p>稀缺这种核心驱动力极其不直观、不理性，仅仅因为我们得不到，或者很难得到某样东西。比如我们买不起的东西、没有资格加入的团体、集不齐的盲盒、还未发布的产品。</p>
<p>有些诱惑毫无意义。有人这么分析人们大脑的行为逻辑：</p>
<ul>
  <li>追逐离我们远去的东西</li>
  <li>渴望得不到的东西</li>
  <li>只重视难以获得的东西</li>
</ul>
<p>想想看成功的砍价是不是转身欲走，成功的销售是不是卖给「别人」。</p>

<div class="feature-block">
  <p class="lead"><strong>制造稀缺</strong> — 微博限制了用户只能输入 140 个字，抖音限制了几十秒的视频时长，这些限制都是人为的，但似乎并没有阻碍用户的创作。朋友圈限制了内容的触达与传播，但却实实在在地定义了一种社交方式。如果我们想增加用户的某种行为，一种有效的方式是对这个行为加以限制。与稀缺相对应的是富足感，越富足，越无聊，有稀缺才会有挑战，也才会有动力。然而同样，过于稀缺就会制造焦虑，这就走向了另一个极端。</p>
  <div class="split reverse">
    {img("Untitled22.jpg", "信息过载示例", "")}
    <div class="text">
      <p>这是我打开微博常常看到的一个页面，非常讨厌，不仅每个分类可以左右划，上下竟然有两三屏之多，它似乎在告诉我「我这儿信息很多」，但我却无动于衷。</p>
      <p><em>一个人真的关心很多信息，那么他一定是什么也不关心的。</em></p>
      <p>另一种有趣的做法是，一个产品对于用户兴趣标签加以限制，最多选择 5 个。这个稀缺可能并不存在——有可能 90% 的人都只选择了小于 5 个标签。那么这个限制对于大多数人并不会真的影响使用，反而让用户在选择标签时更认真。</p>
    </div>
  </div>
</div>

<ul>
  <li><strong>时间窗口</strong> — 当我办了一张盒马的会员卡后，我第一次知道有「会员日」这个概念，并不是任何时候去店里都有优惠，而是一周内特定的一天去购物才会有折扣。初看很不科学，但实际很精妙，它在时间上制造了一种稀缺，反而让我总想着它，并促使我把一段时间的购物需求都集中到一起。类似的做法还有 618、双 11 等购物节。</li>
  <li><strong>强制中断</strong> — 与直观的理解不同，很多休闲类的手机游戏对用户游玩时间加以限制，比如玩一次消耗 5 点能量，20 点能量消耗完了就要等待两个小时补充能量才能继续玩。这么做其实有一定的道理：一方面促使玩家每隔一段时间都想进入游戏；另一方面这些游戏本身机制都比较简单，一直玩很容易产生厌烦——强行打断体验，是为了在厌烦情绪到来之前，把最有趣的记忆保留下来，延长游戏的生命力。</li>
</ul>

<h4><span class="drive-num">7</span>不可预测（Unpredictability &amp; Curiosity）</h4>
<p>这是一种极其强大的驱动力，游戏里刷装备、买彩票、抽盲盒、赌博、看电影等等行为背后都有它的影子。本身它是一种黑帽驱动力，如果与其他黑帽驱动力比如稀缺一同使用，可能会产生令人强迫或上瘾的行为（赌博）；但如果与白帽驱动力配合，则能提升它们的效果。</p>
<ul>
  <li><strong>随机奖励</strong> — 游戏中打败敌人后会掉落随机的奖励，每次可能都不一样。这种不可预测性给游戏带来了乐趣，甚至促使玩家反复挑战来获得自己想要的装备。就像小朋友突然收到一件礼物的时候，最开心的事情不是获得了什么东西，而是打开礼物前的期待。盲盒经济充分利用了这个心理——我不想选，我想要惊喜。</li>
  <li><strong>彩蛋</strong> — 盲盒开出啥大体上都是预期之内的，而彩蛋则不同，它完全是用户预期外的惊喜，比如深夜软件上的温馨提醒、生日时收到的祝福和优惠券、电影里致敬另一部你喜爱作品的片段等等。</li>
</ul>

<h4><span class="drive-num">8</span>损失厌恶（Loss &amp; Avoidance）</h4>
<p>这项驱动力是在人们害怕失去一些东西或害怕发生不好的事情时激发。很多游戏都设计了死亡惩罚，可能要从头重来，可能失去金币和经验，这些都是玩家不愿意看到的，于是会更加认真对待游戏。在现实生活中，我们为了避免失去金钱、时间、精力等而行动。很多人被优惠券驱使着去商店购买东西，有可能他不是被优惠金额驱使的，而是被优惠券有效期驱使的。</p>
<p>在若干年前有一个噩梦般的游戏叫《开心农场》，它的机制是在游戏中种菜，一定时间后成熟后就可以收获了。但如果主人没有及时收获，好友就可以过来「偷菜」，而主人则颗粒无收。人们厌恶缺失的程度是获得收益的两倍，我收获两次的快乐也不如被人偷了一次菜的痛苦大。于是很多人半夜设置好多闹钟提醒自己收菜，更有甚者定闹钟提醒自己去偷好友的菜。</p>
<p>早期支付宝的蚂蚁森林也是类似的设计，只是把菜换成了能量。不过如今已经增加了很多其他的机制来淡化这种零和竞争的互动，比如你可以帮好友收能量，把损失厌恶的驱动力向社交和所有权转移。</p>
<ul>
  <li><strong>倒计时</strong> — 新人礼包倒计时一天，不用就作废；商品优惠，倒计时 48 个小时恢复原价。这样的营销手段我们见过无数次了，但还是次次会上钩。</li>
  <li><strong>签到系统</strong> — 直观上签到系统应该受所有权或成长与成就这类核心驱动力影响，但更起到作用的是损失厌恶。签到系统一般有两个规律：一是奖励是确定的；二是越往后，尤其是最后一天签到的奖励是最丰厚的。到手的奖励没有了，这个损失厌恶的情绪是更强烈的。</li>
  <li><strong>沉没成本监狱</strong> — 用户投入在你的产品中的时间越长，就越难说服自己离开。如果用户没有注册时先写了一篇帖子，点发布时提示登录，那他已经投入时间写帖子了，大概率会完成注册。同样，一个人如果在一个游戏/产品中投入了大量的时间，即使有体验不好的地方，他也不会轻易迁移到其他产品中。</li>
</ul>

<h3>左脑与右脑核心驱动</h3>
<p>在前文中已经提及过左脑和右脑驱动，这里的左脑和右脑只是一个文字符号，并不是真正意义上的左脑和右脑，这个文字符号用以说明各个核心驱动理性的或是感性的倾向而已。</p>

<figure class="hero-fig">
  {img("Untitled23.jpg", "左脑与右脑核心驱动", "")}
  <figcaption>左脑（外在动机）与右脑（内在动机）的分布</figcaption>
</figure>

<div class="two-col">
  <div class="panel left-brain">
    <h4>左脑核心驱动</h4>
    <p>与逻辑、所有权、分析思维相关</p>
    <ul>
      <li>成长与成就</li>
      <li>所有权</li>
      <li>稀缺</li>
    </ul>
    <div class="callout tip" style="margin-bottom:0">
      <h5>✅ 外在动机</h5>
      <p>源自目标、目的或奖励，而任务本身不一定有趣。外在动机更关注结果。</p>
    </div>
  </div>
  <div class="panel right-brain">
    <h4>右脑核心驱动</h4>
    <p>与创造力、社会性和好奇心相关</p>
    <ul>
      <li>创意赋能</li>
      <li>社交影响</li>
      <li>不可预测</li>
    </ul>
    <div class="callout" style="margin-bottom:0">
      <h5>✅ 内在动机</h5>
      <p>源自享受任务，有些事甚至愿意主动花钱花时间去做。内在动机更关注过程。</p>
    </div>
  </div>
</div>
<p>左脑核心驱动的提升可以通过外部目标的引入，起到短期激励的作用；而右脑核心驱动的提升则通常能起到长期的激励作用。</p>

<h3>白帽与黑帽核心驱动</h3>
<figure class="hero-fig">
  {img("Untitled24.jpg", "白帽与黑帽核心驱动", "")}
  <figcaption>白帽（充实感）与黑帽（紧迫感）的分布</figcaption>
</figure>

<div class="two-col">
  <div class="panel white-hat">
    <h4>白帽核心驱动</h4>
    <p>让我们感到强大、满足、充实，能掌握生活</p>
    <ul>
      <li>使命召唤</li>
      <li>成长与成就</li>
      <li>创意赋能</li>
    </ul>
  </div>
  <div class="panel black-hat">
    <h4>黑帽核心驱动</h4>
    <p>让我们感到痴迷、焦虑、上瘾，对生活失控</p>
    <ul>
      <li>稀缺</li>
      <li>不可预测</li>
      <li>损失厌恶</li>
    </ul>
  </div>
</div>

<p>白帽核心驱动的好处显而易见，但它有一个问题：缺乏紧迫感。对，我们是要去拯救世界，可以什么时候去呢？吃完早饭再去也还来得及吧。而黑帽核心驱动则相反，它会形成紧迫感，强迫我们采取一些行动。也正是因为如此，游戏化产品设计有时与数据驱动的产品设计会有冲突，因为所有的黑帽核心驱动都可能达成更好的数据表现，但会让用户在使用产品后有空虚感，最终离开产品。</p>
<p>实际上不管黑帽还是白帽核心驱动，它们本身并不存在好与坏的区分，好与坏取决于这些行为的意图和结果。黑帽核心驱动力也可以用来帮助人们激发好的行为，而白帽核心驱动力也可能用于邪恶的目的产生更严重的影响。</p>

<div class="footer-note">
  <h3>其他未涉及到的内容</h3>
  <ul>
    <li>用户角色划分</li>
    <li>产品阶段的划分</li>
    <li>用 Octalysis 对产品进行分析</li>
    <li>设计不同用户角色在不同产品阶段的体验</li>
  </ul>
  <p style="margin:10px 0 0;color:var(--muted);font-size:9.5pt;">原文发表于 2023 年 4 月 · 概念整理自 Yu-kai Chou 的 Octalysis 框架</p>
</div>

</article>
</div>
</body>
</html>
"""

(OUT / "octalysis.html").write_text(html, encoding="utf-8")
print("Wrote", OUT / "octalysis.html")
