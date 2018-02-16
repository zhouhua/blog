---
title: 带Alpha通道的色彩叠加问题
tags:
  - alpha通道
  - color
  - 色彩
  - 透明
id: 309
category: 技术
layout: post
date: 2015-03-23 17:05:23
---

css3的rgba色彩模式、png/gif图片的alpha通道、canvas的rgba色彩模式、css3的阴影、css3的opacity属性等等，这些应用在网页中，有意无意间，我们的页面多了许多半透明的效果。我们知道，在没有alpha通道的情况下，两个颜色叠加，上层的颜色会直接覆盖下层的颜色，但有了alpha通道，一切就没有这么简单了。今天，我们就要探讨一下，网页中，_rgba(r<sub>1</sub>, g<sub>1</sub>, b<sub>1</sub>, a<sub>1</sub>) + rgba(r<sub>2</sub>, g<sub>2</sub>, b<sub>2</sub>, a<sub>2</sub>)_会得到什么。

为表述方便，不妨假设最后我们得到的色彩是_rgba(r, g, b, a)_。

先考虑透明度。一个色彩透明度_opacity_介于0到1之间，_opacity=0_表示完全透明，_opacity=1_表示不透明。把要叠加上来的色彩想象成一块玻璃，如果这块玻璃的透明度是0.2，意味着它允许透过80%的光线，阻挡20%的光线。

好，现在想象有两块玻璃，透明度分别是_a<sub>1</sub>_和_a<sub>2</sub>_，那么光线的通过率分别为_1-a<sub>1</sub>_和_1-a<sub>2</sub>_。所以可以认为，光线穿过第一块玻璃后，剩余_1-a<sub>1</sub>_；再通过第二块玻璃后，还有_(1-a1)(1-a<sub>2</sub>)_，这就是两块玻璃的综合透光率，相应的，透明度就是_1-(1-a<sub>1</sub>)(1-a<sub>2</sub>)_。

所以我们能得到第一个结论：

![render (1)](http://www.zhouhua.info/wp-content/uploads/2015/03/render-11.gif)，即

![render (1)](http://www.zhouhua.info/wp-content/uploads/2015/03/render-12.gif)

接下来考虑rgb各分量，它们的计算方法是一样的，我们仅以r通道为例，进行推导。还是想象一块半透明的玻璃，它本身是红色的，但由于它允许其他光线透过，所以玻璃本身的颜色会变淡。人们实际感受到的颜色，只是玻璃原本的颜色乘以透明度的结果。

如果有两块玻璃呢，它们的红色浓度分别是_r<sub>1</sub>_和_r<sub>2</sub>_，透明度分别是_a<sub>1</sub>_和_a<sub>2</sub>_。那么第一块玻璃让人感受到的红色浓度为_r<sub>1</sub>a<sub>1</sub>_，第二块玻璃让人感受到的红色浓度为_r<sub>2</sub>a<sub>2</sub>_，第一块玻璃的红色色彩穿过第二块玻璃，并与第二块的红色叠加在一起的颜色浓度就是：

![render (1)](http://www.zhouhua.info/wp-content/uploads/2015/03/render-13.gif)

接下来，我们再把两块玻璃合起来，当成一块玻璃，这个整体的红色浓度为r，透明度为_a_。这个_a_我们之前已经推导过了，是_a<sub>1</sub>+a<sub>2</sub>-a<sub>1</sub>a<sub>2</sub>_。那么，我们有：

![render (1)](http://www.zhouhua.info/wp-content/uploads/2015/03/render-14.gif)

由这两个等式，我们可以得出：

![render (1)](http://www.zhouhua.info/wp-content/uploads/2015/03/render-1.gif)

 g和b两个分量上也是如此，在此从略。从推导出来的等式上，我们能直接得出一个结论：颜色叠加的运算，不具备交换率、结合率，也就是说，叠加的顺序很重要。

最后来验证一下吧：

## canvas

rgba(235, 152, 80, 0.6)+rgba(234, 97, 124, 0.8)

<div class="container-color">
    <canvas data-color="235,152,80,0.6" width="200" height="100" class="leftSample"></canvas>

    <canvas data-color="234,97,124,0.8" width="200" height="100" class="rightSample"></canvas>
</div>

rgba(234, 104, 118, 0.92)

<div class="container-color">
    <canvas data-color="234,104,118,0.92" width="300" height="100"></canvas>
</div>

## background

rgba(235, 152, 80, 0.6)+rgba(234, 97, 124, 0.8)

<div class="container-color">
<div data-color="235,152,80,0.6" width="200" height="100" class="leftSample backgroundSample"></div>
<div data-color="234,97,124,0.8" width="200" height="100" class="rightSample backgroundSample"></div>
</div>

rgba(234, 104, 118, 0.92)

<div class="container-color">
<div data-color="234,104,118,0.92" class="backgroundSample"></div>
</div>
