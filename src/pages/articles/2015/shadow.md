---
title: 更优雅地绘制阴影
tags:
  - box-shadow
  - CSS
  - css3
  - 半透明
  - 阴影
  - 颜色
id: 323
category: 技术
layout: post
date: 2015-03-24 18:12:43
---

Box-shadow虽然是一个css3的属性，但由于浏览器支持不错，且用它来营造一种立体感、层次感着实方便，这让它成为了互联网上随处可见的css3特效。不过我感觉想写好阴影不是一件容易的事情。至少我常常摸索半天，写出来的阴影却总让人很难受。 上周在知乎上看到了一个问答，很受启发：[如何理解 Material Design 中卡片的两层阴影](http://www.zhihu.com/question/28865209)，于是特意去看了Meterial Design的设计准则（[中文翻译](http://design.1sters.com/material_design/layout/layout-principles.html)），觉得其中的一些设计思想和细节追求很值得我们去借签。

本文标题是“更优雅地绘制阴影”，但其实我并不懂“优雅”是什么，只是觉得别人的做法比我的好，比我的优雅。那么就来看看别人是怎么理解阴影的。

Meterial Design把App的部件、面板、模态框等都抽象成了卡片。对于一个个上面，除了有x/y轴坐标的定义，还增加了z轴。处于不同层级的卡片，有着相对独立的交互逻辑。可以说，卡片和层级就是一个app页面的交互隐喻。而层次的视觉定义就是通过阴影来完成。下面搬运两张图：

![layout-principles-dimensionality-shadows-01_large_mdpi](http://www.zhouhua.info/wp-content/uploads/2015/03/layout-principles-dimensionality-shadows-01_large_mdpi.png)![layout-principles-dimensionality-shadows-08_large_mdpi](http://www.zhouhua.info/wp-content/uploads/2015/03/layout-principles-dimensionality-shadows-08_large_mdpi.png)

以上的阴影定义虽然是AI的格式，但很容易就能转换成前端的语言：

`.z-index-1{
    box-shadow: 0 1px 1.5px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.24);
}
.z-index-2{
    box-shadow: 0 3px 3px 0 rgba(0,0,0,0.16), 0 3px 3px 0 rgba(0,0,0,0.23);
}
.z-index-3{
    box-shadow: 0 10px 10px rgba(0,0,0,0.19), 0 6px 3px rgba(0,0,0,0.23);
}
.z-index-4{
    box-shadow: 0 14px 14px rgba(0,0,0,0.25), 0 10px 5px rgba(0,0,0,0.22);
}
.z-index-5{
    box-shadow: 0 19px 19px rgba(0,0,0,0.30), 0 15px 6px rgba(0,0,0,0.22);
}`

看看效果：

<div class="box-container">
<div class="box z-index-1"></div>
<div class="box z-index-2"></div>
<div class="box z-index-3"></div>
<div class="box z-index-4"></div>
<div class="box z-index-5"></div>
</div>

嗯，确实比我自己实现的感觉要优雅。

> 先插几句话，`box-shadow` 属性很有意思，它允许有若干重属性值，效果是相互叠加。张鑫旭有一篇博客谈这个问题（[传送门](http://www.zhangxinxu.com/wordpress/2013/11/css-css3-box-shadow-%E7%9B%92%E9%98%B4%E5%BD%B1-%E5%9B%BE%E5%BD%A2%E7%94%9F%E6%88%90%E6%8A%80%E6%9C%AF/)），写得很好，大家可以参考一下。

这样的阴影效果大家自行感受，我觉得不管怎么样，好过我自己编造、瞎调出来的。但为什么要使用双重阴影？官方解释是用两个光源来模拟现实场景，一个是关键光，一个是环境光，所以会产生两个阴影。另外[@jordanfc迟方的回答](http://www.zhihu.com/question/28865209/answer/42385558)很棒，但很多是结论性的东西，我们需要更多一点思考。

## 思考一：box-shadow绘制阴影时，参照光源到底是什么样子的？

先说明：本文重点探究外阴影的阴影浓度和blur参数之间的关系，认为光源距离物体的距离远大于物体尺寸，忽略spread参数。首先考虑在box-shadow中，阴影颜色允许有半透明色，例如rgba(0, 0, 0, 0.6)，这其实代表了存在了40%的均匀分布的环境光，这部分光我们可以不作考虑，因为它相当于常量，对整个阴影衰减的模型没有影响，同样，阴影的颜色也没有影响，可以不考虑。对于上面的阴影色彩，我们探究的是，阴影浓度是如何从0.6（仅仅定义了衰变的起点）到0的。

在网页中，对一个元素定义阴影后，我们发现，这个元素各个方向上的阴影是相同的。这说明什么呢？如果一个人站在这个阴影里，我们在元素外面画一个框，框与元素边界的距离是固定的，那么这个人在这个框的任何一个地方，看到的光源面积是相等的。所以我们能得出一个结论，光源应该是一个面光源，且形状与元素的形状是匹配的。为什么说是匹配，因为除了元素是圆形外，其他形状，我还想象不出光源应该是什么样。有可能对于绝大多数情况，能产生box-shadow属性效果的光源，在现实生活中根本不存在。（Kidding me?）

## 思考二：如果这样的光源存在，更真实的阴影是什么样的

我们看一个物体的阴影，只会直观地感受阴影的形态是否合理，并不会逆推光源是否合理，因为现实中的光照情形太多复杂，有太多的不确定。那么如果上述的光源客观存在，那么阴影是什么样的呢？

阴影的浓度和这个位置所能看到的光源面积反相关，这个应该不用解释。光源的形态不好确定，我们不妨降低一个维度，考虑一维情形下的规律：

![light](http://www.zhouhua.info/wp-content/uploads/2015/03/light.png)

假设阴影模糊半径为Blur，观察点距离物体的垂直投影边界为x（0<=x<=Blur），降维到一维情形下，光源长度为L，能照到观察点的光源长度为l，那么有：

![png](http://www.zhouhua.info/wp-content/uploads/2015/03/png.png)

推广到二维，假设光源面积为S，能照到观察点的光源面积为s，则有（不定积分，有一定的憶测成份）![p](http://www.zhouhua.info/wp-content/uploads/2015/03/p.png)

a、b、c为常数，S也是常数，所以简化一下：![simple](http://www.zhouhua.info/wp-content/uploads/2015/03/simple.png)

A、B为常数，A+B=1。当x=0时，s=0，这时阴影最浓，为0pacity；当x=Blur时，s=S，这时阴影消失。那么任意x时，阴影浓度o为：![pic1](http://www.zhouhua.info/wp-content/uploads/2015/03/pic1.png)

由以上两式，可以解出：![new_opacity](http://www.zhouhua.info/wp-content/uploads/2015/03/new_opacity.png)我写到这里已经写不下去了，因为我算出来的结果跟@jordanfc迟方的回答中给出的图像是反的。贴上@jordanfc迟方的图：![b2a27b46cb71d4a86cd55ec3486e2e8b_b](http://www.zhouhua.info/wp-content/uploads/2015/03/b2a27b46cb71d4a86cd55ec3486e2e8b_b.png)

他给出的是一个凹函数图像，我解出来的是一个凸函数，我又对图像没什么研究，是我错了吗？不知道。不过他对于阴影叠加的解释应该是错的。

## 思考三：多重阴影怎么叠加

先看看@jordanfc迟方的理解：![QQ截图20150324155612](http://www.zhouhua.info/wp-content/uploads/2015/03/QQ截图20150324155612.png)

![QQ截图20150324155813](http://www.zhouhua.info/wp-content/uploads/2015/03/QQ截图20150324155813.png)似乎能自圆其说，但是对吗？

考虑两个阴影的叠加，我们混合的都是xx%的黑色，所以这种情况下，无需考虑rgb通道，只考虑alpha通道即可。在上一篇文章[《带Alpha通道的色彩叠加问题》](http://www.zhouhua.info/2015/03/23/color/)中，我们详细推导了透明度混合的方法，现在就用起来！

在Meterial Design中的阴影加入y轴偏移，不妨先处理没有y轴偏移的情况。就以数据比较简单的z-depth-2来进行计算。首先分别写出两个阴影的衰变函数：

![O1](http://www.zhouhua.info/wp-content/uploads/2015/03/O1.png)

![O2](http://www.zhouhua.info/wp-content/uploads/2015/03/O2.png)

由 ![render (1)](http://www.zhouhua.info/wp-content/uploads/2015/03/render-12.gif) 我们可以推导出：![o](http://www.zhouhua.info/wp-content/uploads/2015/03/o.png)

是一个凸函数，跟我推导的结果很类似。既然有方程了，不妨把图像画出来看看：![QQ截图20150324165351](http://www.zhouhua.info/wp-content/uploads/2015/03/QQ截图20150324165351.png)

混合后有阴影曲线曲率很小，但看得出跟@jordanfc迟方所描述的完全不一样。我们可以简单验证一下。由于混合后的曲线曲率很小，可以忽略，我们就把这个二次曲线当成一条直线，方程为：

![04](http://www.zhouhua.info/wp-content/uploads/2015/03/04.png)

翻译成css就是

`box-shadow: 0 3px 3px 0 rgba(0,0,0,0.3532);`

 对比看一下效果，能看出有差异吗？

<div class="box-container">
<div class="box z-index-2"></div>
<div class="box z-index-2-single"></div>
</div>

如果加上了x、y偏移效果会怎么样呢？其实很简单，只要把刚刚的O1(x)和O2(x)改成分段函数，这样计算混合阴影会复杂很多。最后就以z-depth=4的阴影图像给本文收个尾吧：

![QQ截图20150324173902](http://www.zhouhua.info/wp-content/uploads/2015/03/QQ截图20150324173902.png)
