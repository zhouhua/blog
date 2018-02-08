---
title: phantomjs配合kindlegen，kindle看天涯不费力
tags:
  - Javascript
  - kindle
  - phantom
  - phantomjs
  - 多线程
  - 爬虫
id: 242
categories:
  - 技术
layout: post
date: 2015-02-27 22:59:13
---

## 前言

kindle看书挺舒服的，网页上看到大段文字就想搬到kindle里去。以前会用一些转寄的服务，网页上随手点个send to kindle，倒也方便。嗯……还是不要自欺欺人了，read it later === read it never。</p>

后来固定用多看了，多看的推送和amazon的是一样的，只是没有转寄服务了，也就懒得推送网页了。其实不喜欢推送网页的最主要的原因还是体验差，阅读本来就应该是一页一页地读下去，而不是看个几分钟，退出，删除，选下一本。但……如果内容多一点的话，比如天涯上的长帖、小说，嗯，它们本来就应该在kindle上看。联上wifi用浏览器看？不适合我……原因：移动性弱，浏览器弱，支持wifi加密方式少，没买3G的，耗电惨。那怎么办？把帖子扒下来慢慢看！

* * *

&nbsp;

## 准备

如今的码农动不动就写个爬虫，爬这个爬那个。那我们……不行，前端从业者应该用一些“前端特色”的方式来解决这个问题。

### 武器一：phantomjs

无头浏览器，功能强大，绝对让你以最熟悉的方式分析网页。想知道怎么用，移步到[phantomjs使用说明](http://www.zhouhua.info/2014/03/19/phantomjs "phantomjs使用说明")

### 武器二：kindlegen

amazon出品的电子书制作、转换工具，它能把HTML、XML、XHTML、ePub等格式的文档转换成mobi格式，功能强悍、使用简单。amazon不知何故禁止中国地区用户下载，不过通过下面这个链接还是可以下载到的：[https://kdp.amazon.com/help?topicId=A3IWA2TQYMZ5J6](https://kdp.amazon.com/help?topicId=A3IWA2TQYMZ5J6) 。

* * *

&nbsp;

## 动手

思路其实不复杂，就是把一个帖子分析一下，从第一页到最后一页，把每一页楼主发表的内容都抓出来，存放到一个html文件中。最后使用kindlegen把这个html转成mobi，大功告成。

建立一个mobi.js文件，开始这次的phantomjs脚本之旅。

### 解析url

&nbsp;

[caption id="attachment_244" align="aligncenter" width="879"]![天涯帖子url示意](http://www.zhouhua.info/wp-content/uploads/2015/02/QQ截图20150227142735.png) 天涯帖子url示意[/caption]

一个普通的天涯帖子url长这个样式。标红的数字表示当前页码，如果样跳转到这个帖子的第5页，只需要把这个数字换成5就可以了。

脚本开始之前，先要获取要采集的网址。假设我们执行：

<pre class="lang:batch decode:true">phantomjs mobi.js [url]</pre>

 那么如何在脚本中得到这个

<pre class="inline:true decode:1 " >url</pre>

呢？

<pre class="lang:js decode:true" title="获取参数">var system = require('system');
var args = system.args;

if (args.length === 1) {
    console.log('请输入要采集的网址！');
    phantom.exit(-1);
}
var url = args[1];</pre>

 对于这个url，我们关注的焦点应该在页码处。关于这一点，我们很容易把url的后面一部分抽象成

<pre class="lang:default decode:1 inline:1 " >-{Number}.shtml</pre>

 ，写成正则表达式：

<pre class="lang:js decode:1 inline:1 " >/^(.+)-([0-9]+)\.shtml$/</pre>

 。好了，验证url的代码可以像这样：

<pre class="lang:js decode:true">var scope = {
    content: '', // 提取内容
    page: 1, // 当前页码
    counts: 0 // 总页码
};

var r = /^(.+)-([0-9]+)\.shtml$/;
var matches = url.match(r);
if (matches.length === 3) {
    spider(scope); // 后面讲
}
else {
    console.log('无法解析url');
    phantom.exit(-1);
}</pre>

 多说一句，这个正则有两个子模式，前一个会匹配出这个帖子特有的url信息，那么我们想跳转到第n页的话，可以这样拼出url：

<pre class="lang:js decode:true" title="拼出特定页码的url">var url = matches[1] + '-' + n + '.shtml';</pre>

### 页面分析

上面的代码已经看到

<pre class="lang:js highlight:0 decode:1 inline:1 " >spider()</pre>

 方法，这是个递归方法，从第一页递归到最后一页，每一层递归间通过

<pre class="lang:js highlight:0 decode:1 inline:1 " >scope</pre>

 这个全局变量传递参数。下面看看到底怎么实现的。

<pre class="lang:js decode:true" title="递归处理每页帖子">var webPage = require('webpage');
var page = webPage.create();

function spider(scope) {
    var url = matches[1] + '-' + scope.page + '.shtml';

    page.open(url, function (status) {
        if (status === 'success') {
            page.injectJs('jq.js');
            scope = page.evaluate(function (scope) {
                // 提取文章内容
                return scope;
            }, scope);

            if (scope.page === scope.counts) {
                writer(scope);
            }
            else {
                scope.page++;
                spider(scope);
            }
        }
        else {
            console.log('无法打开' + url);
            phantom.exit(-1);
        }
    });
}</pre>

 上面这段代码流程是根据当前页码，生成要采集的url（上文已经解释过）。用phantomjs打开这个url。如果打开成功，则提取文章内容（具体做法下文再阐述）。提取完成后，如果现在已经是最后一页，则抓取工作结束，把提取的内容输出出来，否则当前页数加上1，重新执行

<pre class="lang:js highlight:0 decode:1 inline:1 " >spider</pre>

 方法重复上述流程。

这段代码逻辑并不复杂，但是用到phantomjs webPage模块的一些api，如果不熟悉，可以参考[phantomjs使用](http://www.zhouhua.info/2014/03/19/phantomjs "phantomjs使用说明")。下面来说说具体如何提取需要的内容。

<pre class="lang:js decode:true " title="提取帖子内容">scope = page.evaluate(function (scope) {
    var $ = jQuery;
    if (!scope.counts) {
        scope.counts = bbsGlobal.pageCount;
        scope.hostName = bbsGlobal.dashang.getName;
        scope.title=$('title').text();
    }

    var posts = $('[_host="' + scope.hostName + '"]');
    posts.each(function () {
        var $this = $(this);
        scope.content += '&lt;div class="post-content"&gt;' + $this.find('.bbs-content').html() +
            '&lt;/div&gt;&lt;br/&gt;&lt;hr/&gt;';
    });
    return scope;
}, scope);</pre>

 使用phantomjs的

<pre class="lang:js highlight:0 decode:1 inline:1 " >evaluate</pre>

 方法来给打开的网页插入一段我们自定义的javascript脚本，之前我们已经用js注入的方法把jquery引入了，当然，你需求的一切类库都可以自由引入。所以现在天涯的网页就像我们自己开发的网页一样，可以自由使用javascript来操作。这里呢，我继续把

<pre class="lang:js highlight:0 decode:1 inline:1 " >scope</pre>

 这个变量作为page对象内注入脚本和外部phantomjs环境间通信的信使。注意，这个

<pre class="lang:js highlight:0 decode:1 inline:1 " >scope</pre>

 一定要是一个可以序列化成JSON字符串的对象。

OK，至此现在该分析网页本身的结构了。首先我在代码中发现一个全局变量

<pre class="lang:js highlight:0 decode:1 inline:1 " >bbsGlobal</pre>

 ，可以从中得到总页数和作者ID![](http://www.zhouhua.info/wp-content/uploads/2015/02/QQ截图201502271427351.png)

于是，嗯，我就直接拿来用了。再看帖子结构，如下：![QQ截图20150227142735](http://www.zhouhua.info/wp-content/uploads/2015/02/QQ截图201502271427352.png)

我们可以直接用

<pre class="lang:js decode:1 inline:1 " >$('[_host="' + scope.hostName + '"] .bbs-content')</pre>

 把正文节点都找出来，然后拼合在一起，完成！

### 输出HTML

上面在

<pre class="lang:js highlight:0 decode:1 inline:1 " >spider</pre>

 方法内可以看到我调用了一个

<pre class="lang:js highlight:0 decode:1 inline:1 " >writer</pre>

 方法，现在就看看这个方法是怎么实现的吧：

<pre class="lang:js decode:true">var fs = require('fs');
var outputPath = 'output';

function writer(scope) {
    var html='&lt;!DOCTYPE html&gt;&lt;html&gt;&lt;head lang="en"&gt;&lt;title&gt;'+
        scope.title+
        '&lt;/title&gt;&lt;/head&gt;&lt;body&gt;'+
        scope.content.replace(/&lt;br\/&gt;$/, '')+
        '&lt;/body&gt;&lt;/html&gt;';
    var path=outputPath+'/'+scope.title.replace(/[ \\\/:,，\?？\-\.\+]/g,'')+'.html';
    fs.write(path,html,{
        charset:'gb18030'
    });
    // HTML转modi下文讲 
}</pre>

 用一个很简单的html把提取出来的内容包好，写到一个html文件中。两个注意点：一是这里是允许加入排版的，css是支持的，这部分我略过，有兴趣的可以自己摸索；另一点是如果出现乱码，请在保存html文件时就指定好文件编码，在html文件中指定

<pre class="lang:xhtml decode:1 inline:1 " >&lt;mate charset /&gt;</pre>

 被验证是无效的，转换时不起作用。文件写入完成后，就进入转换格式的流程了。

### 转换mobi

<pre class="lang:js decode:true ">var process = require("child_process");
var child = process.spawn("./kindlegen.exe", [path]);

child.stderr.on("data", function (data) {
    console.log("spawnSTDERR:", JSON.stringify(data))
});

child.on("exit", function (code) {
    console.log('finish!');
    phantom.exit(-1);
});</pre>

 使用phantomjs的child_process模块调用kindlegen来转换，并捕获产生的错误信息。完成后，phantomjs脚本也完成。

至此，大功告成。把生成的mobi文档拷到kindle里，enjoy吧。

## 补充

主要内容都说完了，还有一些不主要的。首先是样式和编码，这两个特别实用，是允许自定义的，前文已经有所提及，我不展开了。

下面要说一点没提及的东西了。你如果真的按我前面说的去做，你会被这抓取速度逼疯——实在太慢了！于是你需要掌握新技能：只下载需要的，中断一切无关的请求。什么是无关请求呢？css、js、图片、广告、站长统计等等。怎么解？so easy:

<pre class="lang:js decode:true">page.onResourceRequested = function(requestData, request) {
    if ((/http:\/\/.+?\.css/gi).test(requestData['url'])) {
        request.abort();
    }
    if ((/http:\/\/.*baidu/gi).test(requestData['url'])) {
        request.abort();
    }
    if ((/http:\/\/.*jd/gi).test(requestData['url'])) {
        request.abort();
    }
    if ((/http:\/\/.+?\.jpg/gi).test(requestData['url'])) {
        request.abort();
    }
    if ((/http:\/\/.+?\.png/gi).test(requestData['url'])) {
        request.abort();
    }
    if ((/http:\/\/.+?\.js/gi).test(requestData['url'])) {
        request.abort();
    }
};</pre>

 把无关请求的特征找出来，直接在请求发起时，中断好了。

等等……好像漏了什么。对，图片呢？mobi格式是访问不了天涯的图片的，我们不仅没有把图片下载下来，还把下载图片的请求给中止了。这……这只能留给感兴趣的同学自己完成了，我只能提示你注意天涯图片使用了懒加载，另外调用open方法时可能使得之前所有的request全部中断，不想每一页都等到图片下载完成才能处理下一页的话，建议另开线程处理图片下载。当然我是没兴趣研究这个，因为……不会。不过考虑抓取速度和kindle图片显示效果，这图片就算了。

最后，放上[下载链接](http://www.zhouhua.info/wp-content/uploads/2015/02/mobi.zip)。
