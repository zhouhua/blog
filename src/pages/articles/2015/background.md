---
title: 必会CSS3技能：background-clip/background-origin
tags:
  - background-clip
  - background-origin
  - CSS
  - css3
id: 253
categories:
  - 技术
layout: post
date: 2015-03-03 11:46:54
---

CSS3中新增了许多background类的属性。今天就来聊聊**background-clip**和**background-origin**。为什么把它们俩放一起说呢？因为它们俩很“默契”地拥有相同的属性值。</p>

## background-clip

先说**background-clip**。

<pre class="lang:css decode:true" title="语法">background-clip: &lt;border-box|padding-box|content-box|inherit&gt;#</pre>

 可以看到它有三个属性值：

<dl>
<dt><pre class="inline:true decode:1 " >border-box</pre></dt>
<dd>background能够延伸到边框的外沿（但从Z轴方向上看，会被边框给盖住）。</dd>
<dt><pre class="inline:true decode:1 " >padding-box</pre></dt>
<dd>background能够延伸到内边框的外沿。</dd>
<dt><pre class="inline:true decode:1 " >content-box</pre></dt>
<dd>background裁剪到内容区域。</dd>
</dl>

其实这个属性表现的就是一个盒子模型到底什么区域能显示背景。来看看效果：

<pre class="lang:css decode:true" title="代码示例">.box{
    height: 100px;
    width: 200px;
    margin: 0 auto;
    padding: 20px;
    border: 20px dotted #222;
    background-image: url(http://zhouhua.qiniudn.com/test.jpg);
}</pre>

<div class="box"> </div>

background-clip:<select id="clips">
<option value="border-box">border-box</option>
<option value="padding-box">padding-box</option>
<option value="content-box">content-box</option>
</select>

border-radius:<input id="clipsRadius" style="width: 30px;" type="text" value="0" />px

通过上面的演示，大家应该能比较直观的了解这个属性的作用。对于这个属性，还有几点想和大家说明一下。

首先是如果存在

<pre class="lang:js highlight:0 decode:1 inline:1 " >border-radius</pre>

 时，

<pre class="lang:js highlight:0 decode:1 inline:1 " >background-clip</pre>

 的表现如何？圆角缺失处是否会渲染背景？大家可以试着调节一下圆角半径来体会一下。

另外一个问题是取多个属性值的问题。MDN和一些CSS3的参考书籍上均指出

<pre class="lang:js highlight:0 decode:1 inline:1 " >background-clip</pre>

 可以有多个属性值，大体类似<span style="font-size: 12px; line-height: 19.2000007629395px; background-color: #d2eeca;">font-family</span> ，以逗号分隔。不过我稍微验证了一下，没能发现有什么用。

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
<td><pre class="inline:true decode:1 " >content-box</pre></td>
<td>1.0</td>
<td>4.0 (2.0) </td>
<td>9.0 </td>
<td>12.0 (或更早)</td>
<td>3.0 (522) </td>
</tr>
</tbody>
</table>

注：Firefox 3.6之前，支持的取值为padding | border，另外webkit带前缀时，支持border | padding | content这三个替代属性值。

&nbsp;

## background-origin

**background-clip**是描述背景裁切方式的属性，从字面意义上，我想大家也能猜到**background-origin**是描述坐标原点相关的属性。

<pre class="lang:css decode:true" title="语法">background-origin: &lt;border-box|padding-box|content-box|inherit&gt;#</pre>

 同样，它有三个属性值：

<dl>
<dt><pre class="inline:true decode:1 " >border-box</pre></dt>
<dd>background以border-box的左上角为起点开始渲染，或者说background-position的起始点为border-box的左上角。</dd>
<dt><pre class="inline:true decode:1 " >padding-box</pre></dt>
<dd>background以padding-box的左上角为起点开始渲染，或者说background-position的起始点为padding-box的左上角。</dd>
<dt><pre class="inline:true decode:1 " >content-box</pre></dt>
<dd>background以padding-box的左上角为起点开始渲染，或者说background-position的起始点为padding-box的左上角。</dd>
</dl>

单看定义可能会有些让人一头雾水，还是通过实践来体会吧：

<pre class="lang:css decode:true" title="代码示例">.box{
    height: 100px;
    width: 200px;
    margin: 0 auto;
    padding: 20px;
    border: 20px dotted #222;
    background-image: url(http://zhouhua.qiniudn.com/test.jpg);
}</pre>

<div class="box"> </div>

background-clip:<select id="clips2">
<option value="border-box">border-box</option>
<option value="padding-box">padding-box</option>
<option value="content-box">content-box</option>
</select>

background-origin:<select id="origins2">
<option value="border-box">border-box</option>
<option value="padding-box">padding-box</option>
<option value="content-box">content-box</option>
</select>

border-radius:<input id="clipsRadius2" style="width: 30px;" type="text" value="0" />px

background-position:<input id="x" style="width: 30px;" type="text" value="0" />px <input id="y" style="width: 30px;" type="text" value="0" />px

background-attachment:<select id="attachment">
<option value="fixed">fixed</option>
<option value="scroll">scroll</option>
</select>

多尝试尝试，我想background-origin的作用还是比较容易感受理解的。同时，也注意体会background-position和background-origin属性的联系与区别。另外要提一点就是如果设置了background-attachment为fixed，则background-origin无效。

MDN上指出

<pre class="lang:js highlight:0 decode:1 inline:1 " >background-origin</pre>

 可以有多个属性值，我还是没试出效果。

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
<td><pre class="inline:true decode:1 " >content-box</pre></td>
<td>1.0</td>
<td>4.0 (2.0) </td>
<td>9.0 </td>
<td>不支持</td>
<td>3.0 (522) </td>
</tr>
</tbody>
</table>

注：类似于background-clip，Firefox 3.6之前，支持的取值为padding | border，另外webkit带前缀时，支持border | padding | content这三个替代属性值。

&nbsp;
