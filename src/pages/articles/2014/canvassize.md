---
title: canvas元素的宽高
tags:
  - canvas
  - CSS
  - html5
  - Javascript
  - 椭圆
id: 202
category: 技术
layout: post
date: 2014-12-23 22:56:06
---

设置一个元素的尺寸，推荐的做法是通过css设置其 `width` 和 `height`。不过今天我们说说一个特例：**`canvas`**。本文内容比较简单，我不做示例。

常见的设置

<pre class="inline:true decode:1 " >canvas</pre>

元素尺寸有两种方法。

1.  给<pre class="inline:true decode:1 " >canvas</pre>元素设置属性，例如：
<pre class="lang:xhtml decode:true "><canvas width="400" height="400">
</canvas></pre>

2.  2\. 给<pre class="inline:true decode:1 " >canvas</pre>对象设置属性，例如：
<pre class="lang:js decode:true">var canvas = document.getElementById('canvas');
canvas.width = 400;
canvas.height = 400;</pre>

不过如果你采用css来控制：

<pre class="lang:css decode:true">canvas{
    width:400px;
    height:400px;
}</pre>

则会发现

<pre class="inline:true decode:1 " >canvas</pre>

画出的图形变形了。为什么会这样？原来不同于其他元素，你只能通过前两种方式设置

<pre class="inline:true decode:1 " >canvas</pre>

的尺寸，因为

<pre class="inline:true decode:1 " >canvas</pre>

是基于像素点渲染的，它的渲染可以说完全依赖于

<pre class="inline:true decode:1 " >imageData</pre>

，如果不通过

<pre class="inline:true decode:1 " >canvas</pre>

而直接改变

<pre class="inline:true decode:1 " >canvas</pre>

尺寸，那么

<pre class="inline:true decode:1 " >imageData</pre>

里的数据将完全无效。那么为什么用css设置宽高会发生变形呢？首先我们需要知道，通常一个未设置尺寸的

<pre class="inline:true decode:1 " >canvas</pre>

元素是有一个默认宽高的，为

<pre class="inline:true decode:1 " >300px &times;&nbsp;150px</pre>

，如果css中没有将宽高设置成

<pre class="inline:true decode:1 " >canvas</pre>

元素的宽高，那么这个它会在原有尺寸的基础上，拉伸到css中设置的尺寸。从这点上看，跟图片的宽高处理是一样的（只不过图片通过属性或css设置尺寸基本上效果是一样的）。

当然，通过css设置

<pre class="inline:true decode:1 " >canvas</pre>

的尺寸也并不一定是无用的，有害的。比如在画椭圆的时候，是不是又多了一种简单的途径？
