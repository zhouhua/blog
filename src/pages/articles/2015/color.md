---
title: 带 Alpha 通道的色彩叠加问题
tags:
  - alpha通道
  - color
  - 色彩
  - 透明
id: 309
hero: ./color.jpg
category: 技术
layout: post
date: 2015-03-23 17:05:23
---

css3 的 rgba 色彩模式、png/gif 图片的 alpha 通道、canvas 的 rgba 色彩模式、css3 的阴影、css3 的 opacity 属性等等，这些应用在网页中，有意无意间，我们的页面多了许多半透明的效果。我们知道，在没有 alpha 通道的情况下，两个颜色叠加，上层的颜色会直接覆盖下层的颜色，但有了 alpha 通道，一切就没有这么简单了。今天，我们就要探讨一下，网页中，$rgba(r_1, g_1, b_1, a_1) + rgba(r_2, g_2, b_2, a_2)$ 会得到什么。

为表述方便，不妨假设最后我们得到的色彩是 $rgba(r, g, b, a)$。

先考虑透明度。一个色彩透明度 $opacity$ 介于0到1之间，$opacity=0$ 表示完全透明，$opacity=1$ 表示不透明。把要叠加上来的色彩想象成一块玻璃，如果这块玻璃的透明度是0.2，意味着它允许透过80%的光线，阻挡20%的光线。

好，现在想象有两块玻璃，透明度分别是 $a_1$ 和 $a_2$，那么光线的通过率分别为 $1-a_1$ 和 $1-a_2$。所以可以认为，光线穿过第一块玻璃后，剩余 $1-a_1$；再通过第二块玻璃后，还有 $(1-a1)(1-a_2)$，这就是两块玻璃的综合透光率，相应的，透明度就是 $1-(1-a_1)(1-a_2)$。

所以我们能得到第一个结论：

$$
a=1-(1-a_1)(1-a_2)
$$

，即

$$
a=a_1+a_2-a_1 a_2
$$

接下来考虑 rgb 各分量，它们的计算方法是一样的，我们仅以r通道为例，进行推导。还是想象一块半透明的玻璃，它本身是红色的，但由于它允许其他光线透过，所以玻璃本身的颜色会变淡。人们实际感受到的颜色，只是玻璃原本的颜色乘以透明度的结果。

如果有两块玻璃呢，它们的红色浓度分别是 $r_1$ 和 $r_2$，透明度分别是 $a_1$ 和 $a_2$。那么第一块玻璃让人感受到的红色浓度为 $r_1 a_1$，第二块玻璃让人感受到的红色浓度为 $r_2 a_2$，第一块玻璃的红色色彩穿过第二块玻璃，并与第二块的红色叠加在一起的颜色浓度就是：

$$
r_{real}=r_1 a_1 (1-a_2) + r_2 a_2 = r_1 a_1 +r_2 a_2-r_1 a_1 a_2
$$

接下来，我们再把两块玻璃合起来，当成一块玻璃，这个整体的红色浓度为 $r$，透明度为 $a$。这个 $a$ 我们之前已经推导过了，是 $a_1+a_2-a_1 a_2$。那么，我们有：

$$
r_{real} = r a = r (a_1 + a_2 - a_1 a_2)
$$

由这两个等式，我们可以得出：

$$
r=\dfrac{r_1 a_1 +r_2 a_2-r_1 a_1 a_2}{a_1 + a_2 - a_1 a_2}
$$

g 和 b 两个分量上也是如此，在此从略。从推导出来的等式上，我们能直接得出一个结论：颜色叠加的运算，不具备交换率、结合率，也就是说，叠加的顺序很重要。

最后来验证一下吧：

<div class="container-color">
    <div data-color="235,152,80,0.6" width="200" height="100" class="leftSample backgroundSample"></div>
    <div data-color="234,97,124,0.8" width="200" height="100" class="rightSample backgroundSample"></div>
</div>
<p class="captain">rgba(235, 152, 80, 0.6) + rgba(234, 97, 124, 0.8)</p>
<div class="container-color">
    <div data-color="234,104,118,0.92" class="backgroundSample"></div>
</div>
<p class="captain">rgba(234, 104, 118, 0.92)</p>

<style>
.container-color {
    width: 300px;
    height: 100px;
    position: relative;
    margin: 1.1em auto;
}
.backgroundSample {
    width: 100%;
    height: 100%;
    background: rgba(234,104,118,.92);
}
.leftSample {
    width: 200px;
    height: 100px;
    left: 0;
    top 0;
    background: rgba(235,152,80,.6);
    position: absolute;
}
.rightSample {
    width: 200px;
    height: 100px;
    right: 0;
    top: 0;
    background: rgba(234,97,124,.8);
    position: absolute;
}
</style>
