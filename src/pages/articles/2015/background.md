---
title: 必会 CSS3 技能：background-clip/background-origin
tags:
  - background-clip
  - background-origin
  - CSS
  - css3
category: 技术
layout: post
date: 2015-03-03 11:46:54
---

CSS3 中新增了许多 background 类的属性。今天就来聊聊 **background-clip** 和 **background-origin**。为什么把它们俩放一起说呢？因为它们俩很“默契”地拥有相同的属性值。</p>

## background-clip

先说 **background-clip**。

```css
background-clip: <border-box|padding-box|content-box|inherit>#
```

 可以看到它有三个属性值：

<dl>
<dt><code>border-box</code></dt>
<dd>background 能够延伸到边框的外沿（但从 Z 轴方向上看，会被边框给盖住）。</dd>
<dt><code>padding-box</code></dt>
<dd>background 能够延伸到内边框的外沿。</dd>
<dt><code>content-box</code></dt>
<dd>background 裁剪到内容区域。</dd>
</dl>

其实这个属性表现的就是一个盒子模型到底什么区域能显示背景。

对于这个属性，还有几点想和大家说明一下。

首先是如果存在 `border-radius` 时，`background-clip` 的表现如何？圆角缺失处是否会渲染背景？大家可以试着调节一下圆角半径来体会一下。

另外一个问题是取多个属性值的问题。MDN 和一些 CSS3 的参考书籍上均指出 `background-clip` 可以有多个属性值，大体类似 `font-family`，以逗号分隔。不过我稍微验证了一下，没能发现有什么用。

最后一个问题是兼容性问题：

<table>
<tbody>
<tr><th>特性</th><th>Chrome</th><th>Firefox (Gecko)</th><th>Internet Explorer</th><th>Opera</th><th>Safari</th></tr>
<tr>
<td>基本支持</td>
<td>1.0</td>
<td>4.0 (2.0) </td>
<td>9.0 </td>
<td>10.5</td>
<td>3.0 (522) </td>
</tr>
<tr>
<td><code>content-box</code></td>
<td>1.0</td>
<td>4.0 (2.0) </td>
<td>9.0 </td>
<td>12.0 (或更早)</td>
<td>3.0 (522) </td>
</tr>
</tbody>
</table>

注：Firefox 3.6之前，支持的取值为 padding | border，另外 webkit 带前缀时，支持 border | padding | content 这三个替代属性值。


## background-origin

**background-clip** 是描述背景裁切方式的属性，从字面意义上，我想大家也能猜到 **background-origin** 是描述坐标原点相关的属性。

```css
background-origin: <border-box|padding-box|content-box|inherit>#
```

同样，它有三个属性值：

<dl>
<dt><code>border-box</code></dt>
<dd>background 以 border-box 的左上角为起点开始渲染，或者说 background-position 的起始点为 border-box 的左上角。</dd>
<dt><code>padding-box</code></dt>
<dd>background 以 padding-box 的左上角为起点开始渲染，或者说 background-position 的起始点为 padding-box 的左上角。</dd>
<dt><code>content-box</code></dt>
<dd>background 以 padding-box 的左上角为起点开始渲染，或者说 background-position 的起始点为 padding-box 的左上角。</dd>
</dl>

多尝试尝试，我想 background-origin 的作用还是比较容易感受理解的。同时，也注意体会 background-position 和 background-origin 属性的联系与区别。另外要提一点就是如果设置了 background-attachment 为 fixed，则 background-origin 无效。

MDN 上指出 `background-origin` 可以有多个属性值，我还是没试出效果。

最后一个问题是兼容性问题：

<table>
<tbody>
<tr><th>特性</th><th>Chrome</th><th>Firefox (Gecko)</th><th>Internet Explorer</th><th>Opera</th><th>Safari</th></tr>
<tr>
<td>基本支持</td>
<td>1.0</td>
<td>4.0 (2.0) </td>
<td>9.0 </td>
<td>10.5</td>
<td>3.0 (522) </td>
</tr>
<tr>
<td><code>content-box</code></td>
<td>1.0</td>
<td>4.0 (2.0) </td>
<td>9.0 </td>
<td>不支持</td>
<td>3.0 (522) </td>
</tr>
</tbody>
</table>

注：类似于 background-clip，Firefox 3.6之前，支持的取值为 padding | border，另外 webkit 带前缀时，支持 border | padding | content 这三个替代属性值。
