---
title: 聊聊rel=noreferrer的事
tags:
  - Javascript
  - noreferrer
  - referer
  - referrer
id: 363
category: 技术
layout: post
date: 2015-03-31 17:47:49
---

## 背景

在一个页面A中，点击一个链接，浏览器会跳转到页面B。那么如何描述A和B的关系呢？我们把A定义为B的refer/referrer/referer（由于历史的原因，你看到上面这几个词都可以认为是同一个意思，下面统一描述为referrer）。通俗地说，A是B的来源页面/引荐页面。从技术实现上，你从浏览器起发出的任何请求（不准确，先这么理解吧），例如打开新页面、请求静态资源、ajax、请求后端api等等，都会在请求头部添加

<pre class="lang:js highlight:0 decode:1 inline:1 " >Referer</pre>

 字段。也许你会发现这个词拼错了，少了个r，但你不可以把它当成错误，虽然最初确实是个错误，但由于在它成为http事实标准前，没有人去纠正这个错误，于是就形成了现在局面。看看具体的例子，在百度上搜索QQ，然后打开腾讯的页面，我们看看它的请求头是什么样的：![20150330201952](http://www.zhouhua.info/wp-content/uploads/2015/03/20150330201952.png)</p>

也可以通过

<pre class="lang:js decode:1 inline:1 " >document.referrer</pre>

 来获取当前页面的referrer地址。

这个referrer常常被人忽视，但其实用处还是很大的。比如通过referer，我们能知道网站的流量从何而来，从而可以更有针对性的做SEO；我们能知道后端提供的api是否被自己站点以外的页面调用（referrer可以伪造，这种判断方式并不安全）；我们能够知道静态资源是否被他们盗用（图片防盗链的原理）等等。

其实referrer这个东西，我们从来都不用担心不会用它，因为浏览器已经帮你实现得好好的。那我们今天要聊什么呢？聊如何干掉这个玩意儿。

## 起因

有这个需求是因为工作中有一些页面需要跳转到某网站（新开页面），但这个网站链接链过去会报400错误，如下图。从浏览器输入地址，则没有问题。

![20150330204257](http://www.zhouhua.info/wp-content/uploads/2015/03/20150330204257.png)

如果链接链过去的时候不带referrer信息，则网页能够正常打开。

那该如何是好呢？

## 思路

到网上搜索了一下，打开网页而不带referrer信息，大概有以下几种方式：

<dl>
<dt>从https跳转到http页面</dt>
<dd><span style="color: #ff0000;">受浏览器实现制约，不确定因素很大</span></dd>
<dt>直接在浏览器中输入url</dt>
<dd><span style="color: #ff0000;">浏览器行为，不可控</span></dd>
<dt>点击浏览器“主页”或者从收藏夹访问</dt>
<dd><span style="color: #ff0000;">浏览器行为，不可控</span></dd>
<dt>使用location.replace()或修改location.href</dt>
<dd><span style="color: #0000ff;">待验证</span></dd>
<dt>使用window.open()打开页面</dt>
<dd><span style="color: #0000ff;">不靠谱</span></dd>
<dt>使用服务器中转一下，302到目标页面</dt>
<dd><span style="color: #008000;">可行，但麻烦</span></dd>
<dt>使用&lt;mete http-equiv="refresh"&gt;转向</dt>
<dd><span style="color: #0000ff;">待验证</span></dd>
</dl>

上面标红字的方式直接放弃了。由于我的首要需求是在新窗口打开页面，所以其他的方式也没给我什么启示。不过打开新窗口还是给我一些启发。我们可以打开一个空页面，再由这个空页面跳转到目标页面。由于空页面没有url，所以目标页面也就不存在referrer。于是方法一到方法四诞生了：

## 方法一：

使用window.open新开页面，并插入一段javascript，用来重定向到目标页面：

<pre class="lang:js decode:true">var url = "http://www.baidu.com/"
window.open('javascript:window.name;', '&lt;script&gt;location.replace("'+url+'")&lt;\/script&gt;');</pre>

<table>
<tbody>
<tr>
<td style="text-align: center; vertical-align: middle;">**chrome**</td>
<td style="text-align: center; vertical-align: middle;">**firefox**</td>
<td style="text-align: center; vertical-align: middle;">**≥ IE10**</td>
<td style="text-align: center; vertical-align: middle;">**≤ IE9**</td>
</tr>
<tr>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="minus-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="minus-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="times-circle" class="fa-2x"]</td>
</tr>
</tbody>
</table>

 chrome中一切正常；firefox和IE10、11能跳转，但referrer还是传递过去了；IE9及更低版本IE则无法跳转。

## 方法二：

通过指定data:text/html来强制浏览器打开一个指定空页面：

<pre class="lang:js decode:true">var url = "http://www.baidu.com/"
window.open('data:text/html,&lt;html&gt;&lt;body&gt;&lt;script&gt;location.replace("' + url + '")&lt;/script&gt;&lt;/body&gt;&lt;/html&gt;');</pre>

当然也可以直接写在a标签的href属性里。

<table>
<tbody>
<tr>
<td style="text-align: center; vertical-align: middle;">**chrome**</td>
<td style="text-align: center; vertical-align: middle;">**firefox**</td>
<td style="text-align: center; vertical-align: middle;">**IE**</td>
</tr>
<tr>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="minus-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="times-circle" class="fa-2x"]</td>
</tr>
</tbody>
</table>

 chrome中一切正常；firefox能跳转，但referrer还是传递过去了；IE9则无法跳转。

## 方法三：

类似于

<pre class="lang:js highlight:0 decode:1 inline:1 " >href="javascript:void(0);"</pre>

 ，一段javascript也是能够当成页面打开的。于是有：

<pre class="lang:js decode:true">var url = "http://www.baidu.com/"
window.open('javascript:location.replace("' + url + '")');</pre>

<table>
<tbody>
<tr>
<td style="text-align: center; vertical-align: middle;">**chrome**</td>
<td style="text-align: center; vertical-align: middle;">**firefox**</td>
<td style="text-align: center; vertical-align: middle;">**IE**</td>
</tr>
<tr>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="minus-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="minus-circle" class="fa-2x"]</td>
</tr>
</tbody>
</table>

 chrome中一切正常；firefox的IE能跳转，但referrer还是传递过去了。

## 方法四：

类似方法二，也是新打开一个页面，不过不是通过javascript跳转，而是通过

<pre class="lang:js highlight:0 decode:1 inline:1 " >&lt;mete http-equiv="refresh"&gt;</pre>

 跳转：

<pre class="lang:js decode:true">var url = "http://www.baidu.com/"
window.open('data:text/html,&lt;html&gt;&lt;head&gt;&lt;meta http-equiv="Refresh" content="0;' + url + '"/&gt;&lt;/head&gt;&lt;body&gt;&lt;/body&gt;&lt;/html&gt;');</pre>

<table>
<tbody>
<tr>
<td style="text-align: center; vertical-align: middle;">**chrome**</td>
<td style="text-align: center; vertical-align: middle;">**firefox**</td>
<td style="text-align: center; vertical-align: middle;">**IE**</td>
</tr>
<tr>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="times-circle" class="fa-2x"]</td>
</tr>
</tbody>
</table>

 chrome和firefox中一切正常；IE不能跳转。

目前为止，所有方法在IE面前都跪了。不过参照firefox唯一成功过的那次，我们不妨对方法一和方法四来个合体：

## 方法五：

综合方法一和方法四，用

<pre class="lang:js decode:1 inline:1 " >window.open()</pre>

 新打开一个页面，不过不是通过javascript跳转，而是通过

<pre class="lang:js highlight:0 decode:1 inline:1 " >&lt;mete http-equiv="refresh"&gt;</pre>

 跳转：

<pre class="lang:js decode:true">var url = "http://www.baidu.com/";
var win = window.open(null, '_blank');
var doc = win.document;
doc.clear();
doc.write('&lt;html&gt;&lt;head&gt;&lt;meta http-equiv="Refresh" content="0; URL=' + url + '"/&gt;&lt;/head&gt;&lt;body&gt;&lt;/body&gt;&lt;/html&gt;');
doc.close();</pre>

<table>
<tbody>
<tr>
<td style="text-align: center; vertical-align: middle;">**chrome**</td>
<td style="text-align: center; vertical-align: middle;">**firefox**</td>
<td style="text-align: center; vertical-align: middle;">**IE**</td>
</tr>
<tr>
<td style="text-align: center; vertical-align: middle;">[icon name="minus-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
</tr>
</tbody>
</table>

 这次chrome跳转是依然携带referrer信息，而firefox和IE中一切正常。

这五种方式都是试图通过javascript构造一个假的空页面，然后再改变页面url实现的。但兼容性却不怎么好。其实呢，兼容性的问题主要出在构建一个假页面的时候，各个浏览器的实现差异太大。那如果不构建假页面，而是真的有这么一个空页面呢（谢谢国耀的思路和实现）？我们再来试试：

## 方法六：

先来创建一个空页面，假设是bridge.html：

<pre class="lang:xhtml decode:true">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head lang="en"&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;script&gt;
    var url = location.search.replace('?url=', '');
    location.replace(decodeURI(url));
&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>

要跳转到目标页面，先跳转到bridge.html：

<pre class="lang:js decode:true">var url = "http://baidu.com";
window.open('bridge.html?url=' + encodeUri(url));</pre>

<table>
<tbody>
<tr>
<td style="text-align: center; vertical-align: middle;">**chrome**</td>
<td style="text-align: center; vertical-align: middle;">**firefox**</td>
<td style="text-align: center; vertical-align: middle;">**IE**</td>
</tr>
<tr>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
</tr>
</tbody>
</table>

 这个方法在几个浏览器中都有不错的表现。不足的是它需要额外添加一个文件，跟服务器的路由、rewrite规则相关，有一定的潜在额外工作需要做。

说了这么多，其实我们要做的事情，html5中已经规定过了，那就是使用rel="noreferrer"。

## 方法七：

这是最简易直观的实现方式，如果一个a标签设置了rel="noreferrer"，那么就表示点击这个链接时不要传递referrer信息。（注意，这个html5标准中和referrer是正确的拼法）

<pre class="lang:xhtml decode:true">&lt;a href="http://baidu.com" target="_blank" rel="noreferrer"&gt;跳转&lt;/a&gt;</pre>

<table>
<tbody>
<tr>
<td style="text-align: center; vertical-align: middle;">**chrome**</td>
<td style="text-align: center; vertical-align: middle;">**firefox**</td>
<td style="text-align: center; vertical-align: middle;">**IE**</td>
</tr>
<tr>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="check-circle" class="fa-2x"]</td>
<td style="text-align: center; vertical-align: middle;">[icon name="minus-circle" class="fa-2x"]</td>
</tr>
</tbody>
</table>

 chrome和firefox中一切正常；IE不理会rel属性。既然是h5的属性值，存在兼容性问题也是意料之中，不过IE11还不支持我也是醉了。

## 方法八：

上面我们曾提及可以通过后端服务转发请求，实现referrer的隐藏。实现原理很简单，服务器是能够控制请求header字段的。当然，最好的情况是不需要我们自己写这样一个中转服务。

有两个公共的页面可以帮助我们完成这一工作：

1.  google

<pre class="lang:js decode:true">var url = "http://www.baidu.com";
window.open('http://www.google.com/url?q=' + encodeURIComponent(url));</pre>

 2. http://www.no-referer.de

<pre class="lang:js decode:true ">var url = "http://www.baidu.com";
window.open('http://www.no-referer.de/' + url);</pre>

 国内google不能正常访问，可以试试下面那个服务。

## 总结

如果我们想不添加其他辅助页面，实现不带referrer的跳转，可以选择的方式很多，很多方法有着兼容性的问题。对于特定浏览器，有多种方法可选时，我们也应该保证以性能最好的方式跳转。不过不要担心，已经有人封装了这个兼容问题：[noreferrer.js](https://github.com/knu/noreferrer)。使用这个jquery库，你只需要给a标签使用rel="noreferrer"就可以了，兼容问题全交给它了。当然，其内部实现离不开上文我们探讨的几种方法。

但是这个类库存在几个问题：

1.  不支持jquery 1.8+版本（依赖`$.browser`的缘故）；
2.  不支持IE 11（IE 11由于userAgent发生变化，老版本jquery不会把它认为是msie）；
3.  google的跳转在国内无法使用；
4.  不支持动态创建的a标签，或者ajax请求回来的html片断中的a标签

针对这几个问题，我做了小修改，需要的可以下载使用。[下载新的noreferrer.js](http://zhouhua.qiniudn.com//wp-content/uploads/2015/03/zh_noreferrer.js)

这个版本无脑地把`$.browser`的代码重新跑了一遍，添加了对IE 11的识别。把google的地址替换成no-referer.de。最重要的是添加$.noreferrerReg()方法，动态创建a标签后可以运行一下。
