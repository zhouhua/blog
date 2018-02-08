---
title: 如何在Node.js环境下操作DOM
tags:
  - dom
  - jsdom
  - Node.js
categories:
  - 技术
  - javascript
layout: post
date: 2014-03-05 22:32:36
---

Javascript之所以为Javascript，很重要的原因是浏览器为其实现了DOM和BOM接口（[参考](http://www.w3school.com.cn/js/pro_js_implement.asp)）。但在Node.js环境下，并没有DOM和BOM，所以html文档与其他类型的文档并无不同，很难进行处理。而前端大量的js类库在Node.js环境下也毫无用武之地。这篇文档就来探究一下，如何在Node.js端进行DOM操作。

## 使用jsdom

虽然Node.js没有DOM支持，但我们可以自己构建一个DOM，而`jsdom`这个库就是用来帮助我们完成这个任务的，它使用javascript构建了符合W3标准的DOM。

### 安装

jsnode本身是javascript的，但它有一个依赖项`Contextify`是用C++编写的。这个依赖项的功能是处理页面内的`script`标签中的js代码，把javascript在一个独立的模拟浏览器环境下运行。所以这个依赖项提供了一个非常重要的特性。从Node.js中加载一个基于C++的模块，可能在windows下出现一些问题，如果在windows下安装不成功，请尝试安装32位版的Node.js再试。另外Node.js加载本地模块还需要Python的支持。

* Windows
    1.  请确认安装了visual studio;
    2.  安装Python 2.7（[点击下载](http://www.python.org/download/)），并把Python安装路径添加到系统变量；
    3.  安装最新版的Node.js，最好是x86版本的（我用x64版本测试成功）；
    4.  使用`npm install npm`更新npm到最新版本；
    5.  使用`npm install jsdom`安装jsdom。

* Mac OS
    1.  请确认安装了Xcode;
    2.  需要安装“Command line tools for XCode”；
    3.  启动过Xcode，并同意授权条款；
    4.  使用`npm install jsdom`安装jsdom。

* Linux（文档不详，未验证）
    1.  请确认安装了make等编译工具；
    2.  使用`npm install jsdom`安装jsdom；
    3.  使用make编译Contextify。

### 简单模式

jsdom提供了`env()`方法可以很轻松地使用jsdom的强大功能。其定义如下：

```js
jsdom.env(string, [scripts], [config], callback);
```

* 参数`string`：可以是一个url、文件名或HTML片断。
* 参数`script`：类型为string或string数组，表示javascript文件的路径或url，这些javascript文件最后会通过`script`标签引用，并**附加到body末尾**。
* 参数`config`：类似于jquery的一些函数参数列表的定义思路，`env()`允许不使用string、script、callback等参数，而直接传入一个config对象包含各种配置信息，当然，config中也可以定义一些其他的配置选项。
* 参数`callback`：回调方法，callback接受两个参数，`error`和`window`。
    * 参数`error`：可能是一个object，为初始化window时抛出的错误；也可能是一个数组，为DOM收集到的脚本错误。
    * 参数`window`：生成的一个全新的window对象。

***

喜闻乐见的示例1：使用url

```js
var jsdom = require("jsdom");

jsdom.env(
  "http://nodejs.org/dist/",
  ["http://code.jquery.com/jquery.js"],
  function (errors, window) {
    console.log("there have been", window.$("a").length, "nodejs releases!");
  }
);
```

此示例直接把要加载的html的url传入进行处理。注意传入的jquery完全是前端使用的js类型，不需要额外对引入的类库做任何处理即可在Node.js端使用它们进行文档处理。不过与前端代码稍有不同的是我们要留意此时window域内的方法对象并不能像在前端代码中那样直接获取，例如，我们并不能直接使用`$`，而是需要使用`window.$`，如果为了简便使用，可以定义好`var $=windwo.$`。

***

喜闻乐见的示例2：使用html片断

```js
var jsdom = require("jsdom");

jsdom.env(
  '&lt;p&gt;&lt;a class="the-link" href="https://github.com/tmpvar/jsdom"&gt;jsdom\'s Homepage&lt;/a&gt;&lt;/p&gt;',
  ["http://code.jquery.com/jquery.js"],
  function (errors, window) {
    console.log("contents of a.the-link:", window.$("a.the-link").text());
  }
);
```

类似的，我们可以通过Node.js的`fs`模块读取本地的view，再传入env()作处理。

***

喜闻乐见的示例3：使用config对象

```js
var jsdom = require("jsdom");
var fs = require("fs");
var jquery = fs.readFileSync("./jquery.js", "utf-8");

jsdom.env({
  url: "http://news.ycombinator.com/",
  src: [jquery],
  done: function (errors, window) {
    var $ = window.$;
    console.log("HN Links");
    $("td.title:not(:last) a").each(function () {
      console.log(" -", $(this).text());
    });
  }
});
```

这个示例展示了通过config对象使用env()方法，这段代码同时也说明了javascript代码也是可以直接读取本地文件并插入到html内的。

### 高级模式

上面的用法应该已经能满足一定的需求，但它的不足在于不支持html代码中定义的外部script、img等资源。还有，在简单模式下，一次只能有一个window对象存在，不能同时处理多个文档。如果有这类的需要，我们可以使用高级模式。jsdom使用的高级模式的方法是`jsdom()`。请参见如下代码：

```js
var jsdom = require("jsdom").jsdom;
var doc = jsdom(markup, level, options);
var window = doc.parentWindow;
```

与简单模式不同的是，它不是采用异步回调的方式，而是采用同步的方式，直接将window对象暴露出来，这意味着在同一段代码域中，可以有多个完全隔离的window对象，可以同时处理多个文档。第二行向jsdom()方法传入了三个参数：

* 参数`markup`：markup表示是的传入的HTML/XML文档（文档片断或空字符串也支持），我们也可以传入null或undefined来生成空白的html文档。
* 参数`level`：指定DOM级别，默认是DOM 3级。
* 参数`option`：option对象与简单模式下的option参数基本相同，不过它拥有一个`features`选项控制着对外部资源的加载情况，具体如下：
    * `FetchExternalResources`
        * 默认值：`["script"]`
        * 允许值：`["script", "img", "css", "frame", "iframe", "link"]`或`false`
        ——是否允许从文件系统或网络获取文件，以及什么类型的文件。
    * `ProcessExternalResources`
        * 默认值：`["script"]`
        * 允许值：`["script"]`或`false`
        ——是否允许执行外部脚本。
    * `SkipExternalResources`
        * 默认值：`false`
        * 允许值：`/url/`或`false`
        ——指定不下载、不执行的资源URL的正则。

### Canvas支持

jsdom本身不对canvas支持，会把它当成div处理，如果需要支持canvas，则需要添加`canvas`包，安装方法（[点击查看详情](https://www.npmjs.org/package/canvas)）：

```bash
npm install canvas
```

### 注意事项

1. 区分两种window
    使用jsdom确实能模拟出一个window，让我们能在Node.js端书写前端代码，但一定要区分这个window与浏览器运行时的window对象不是一回事。在浏览器渲染页面时，浏览器找不到我们定义在Node.js端window上的函数、变量。在Node.js端进行的一些事件绑定也只会绑到模拟出来的dom上，浏览器呈现的时候并不会具有这些事件的绑定。

2. script参数指定的javascript永远在body最末
    虽然没有看到具体文档说明，但在我测试下来呈现这样的情况，因此，如果有多个javascript、多种引入方式，特别是在Node.js端向html插入script节点时，特别要注意先后依赖关系，建议不要通过script参数传入js文件，而是直接以script标签写在html中。

3. jsdom似乎不支持ajax
    没有在jsdom中看到有关xmlHttpRequest的实现，测试结果也是无法使用ajax。可能需要针对Node.js重写zepto的ajax方法。
