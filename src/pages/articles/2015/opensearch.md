---
title: 让你的网站成为自定义搜索引擎
tags:
  - chrome
  - OpenSearch
  - 搜索
id: 447
hero: ./opensearch.jpg
category: 技术
layout: post
date: 2015-06-05 23:27:56
---

## 起

有一天，我在打理博客的时候，无意看到了这样的提示：

![QQ20150527145709](./opensearch/QQ20150527145709.png)

“按 tab 可通过 zhouhua.info 进行搜索”？这是什么？于是我按了 tab：

![QQ20150527150159](./opensearch/QQ20150527150159.png)

看起来很高级嘛！输入“正则表达式”看看：

![QQ20150527150313](./opensearch/QQ20150527150313.png)

竟然真的有效果！到底发生了什么……

打开 chrome 的搜索引擎管理：

![QQ20150527150721](./opensearch/QQ20150527150721.png)

我的博客怎么就被认为是搜索引擎呢？一定要搞明白怎么回事。

## 承

要让浏览器知道自己的网站是一个搜索引擎，在技术上并不难实现。很久之前 amazon 就提出了 [OpenSearch 标准草案](http://www.opensearch.org/Specifications/OpenSearch/1.1#OpenSearch_description_document)。浏览器们是认这个标准的，只是各自实现不太一样。而开发者大多不太了解这玩意儿。总之挺鸡肋的吧，不过挺简单的，单纯提升点逼格也不错。

> 本文所涉及的体验针对 chrome，其他浏览器未测试。据我所知，IE 浏览器处理 OpenSearch 时，并不会主动信任一个网站为搜索引擎，而是需要网站管理者向微软提出申请，审核通过才会被 IE 认为是搜索引擎。

那么就来试试吧。

首先要告诉浏览器：我是搜索引擎。做法很简单，在网页的 head 部分加上这样一行：

```html
<link
  rel="search"
  type="application/opensearchdescription+xml"
  href="http://www.zhouhua.info/opensearch.xml"
  title="step over"
/>
```

我们看到 type 定义了一种从来没见过的 mine 类型 `application/opensearchdescription+xml`
，不用紧张，这是 openSearch 标准规定的，你不用额外对服务器进行配置，只要提供一个能访问到的 xml 文件。在这个例子中，我的 xml 文件路径为 `http://www.zhouhua.info/opensearch.xml`。关键就是要看这个 xml 是什么样的。标准中定义了很多，但我觉得设置几个简单的属性就够了：

```xml
<?xml version="1.0"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
    <ShortName>屠龙刀</ShortName>
    <Description>搜索周骅的博客</Description>
    <Url type="text/html" method="get" template="http://zhouhua.info/?s={searchTerms}"/>
</OpenSearchDescription>
```

我这里定义了三个属性，ShortName 表示搜索引擎的名字，Description 代表搜索引擎的描述，这都比较好理解。比较重要的是 Url 属性，它定义了搜索的方式。有这个例子里，规定了搜索结果是以 text/html 的形式返回，规定了用 get 方式去访问搜索 action，规定了处理搜索的 url 为 http://zhouhua.info/?s={searchTerms}，其中 {searchTerms} 会被用户输入的关键字替换。有一个比较有意思的功能，我稍微说一下，如果你的站点有搜索词建议的功能，你可以再定义一条 Url 字段，将 template 指向请求搜索建议的 ajax 地址，同时设置 rel 属性为 suggestion。类似这样：

```xml
<Url type="application/json" rel="suggestions" template="http://my_site/suggest?q={searchTerms}" />
```

标准里定义了 Url 可以有四种 rel 类型，我感觉比较有价值的就两种，一种是设置获取搜索结果的 url，rel 为 result，这种最重要，如果不设置 rel 属性，那么会默认这个 Url 字段是这个作用；第二种是设置获取搜索建议的 url，它的 rel 属性为 suggestions，如果取这个值，那么这个属性是不可以省略的。其他的两种取值就不说了。

除了以上的一些字段，其实可定制的内容还有很多，有兴趣的可以 [查看文档](http://www.opensearch.org/Specifications/OpenSearch/1.1)，我就不多介绍。因为我迫不及待地想看看设置的效果怎么样。

![QQ20150605222420](./opensearch/QQ20150605222420.png)

效果还是不错的嘛，设置的搜索引擎名称等都生效了，挺好玩的。

## 转

自定义搜索引擎无非就是通过现有的标准，网站向浏览器传达了自己是搜索引擎、传达了自己的特征和用法，而浏览器则根据这些信息把网站添加到搜索引擎列表中，并对它们启用特殊的交互体验（比如输入域名就可以按 tab 进入搜索功能、可以设置成默认搜索引擎等）。

但我的疑问是，一开始我可是什么也没有干呀，那么 chrome 是怎么知道我的网站有搜索功能，并把它添加到了搜索引擎列表中的呢？

在 chrome 的这篇文档中，我找到了答案：[传送门](http://dev.chromium.org/tab-to-search)（英文，需梯子）。

原来在使用 chrome 访问一个网站时，chrome 会先查看有没有定义 OpenSearch。如果没有的话，它会在网页中找有没有这样一个表单：

1. 表单以 GET 方式提交（POST 不可以）；
2. 表单的提交 url 为 HTTP 协议的（HTTPS 不可以）；
3. 表单没有附加 onSubmit 事件（确保提交过程不被用户代码干涉）；
4. 表单中仅包含一个 input 输入框，而且类型为 text（其他类型的都不可以，多余的控件也都不可以）

如果有这样一个表单，chrome 会认为这是一个搜索框，并根据这个表单的信息推断出这个网站的搜索方法。在我的网站中，恰恰有这样的表单：

```html
<form
  role="search"
  method="get"
  id="searchform"
  class="searchform"
  action="http://www.zhouhua.info/"
>
  <div>
    <label class="screen-reader-text" for="s">搜索：</label>
    <input type="text" value="" name="s" id="s" />
    <input type="submit" id="searchsubmit" value="搜索" />
  </div>
</form>
```

这个表单提供的信息和 `<Url type="text/html" method="get" template="http://zhouhua.info/?s={searchTerms}"/>` 是等价的。但并不能提供更多的信息了，所以一开始，chrome 直接是拿网站的域名当成是搜索引擎的名字。

对于 chrome 的这个设计，我持保留意见，毕竟存在一定的误判率。

在 chrome 的文档中，最后一句话提到了添加自定义引擎的第三种方法，使用 `AddSearchProvider` 这个 API。虽然这个文档中只提到了一个词，但并不妨碍我们获取更多信息，MSDN 和 MDN 上都有文档。

[跳到 MSDN](https://msdn.microsoft.com/en-us/library/aa744112.aspx) 、 [跳到 MDN](https://developer.mozilla.org/en-US/docs/Adding_search_engines_from_web_pages)

MDN 的文档中有一个示例程序还是值得学习一下，它对 `AddSearchProvider` 做了兼容性的提升：

```javascript
function installSearchEngine() {
  if (window.external && 'AddSearchProvider' in window.external) {
    // Firefox 2 and IE 7, OpenSearch
    window.external.AddSearchProvider('http://example.com/search-plugin.xml');
  } else if (window.sidebar && 'addSearchEngine' in window.sidebar) {
    // Firefox <= 1.5, Sherlock
    window.sidebar.addSearchEngine(
      'http://example.com/search-plugin.src',
      'http://example.com/search-icon.png',
      'Search Plugin',
      ''
    );
  } else {
    // No search engine support (IE 6, Opera, etc).
    alert('No search engine support');
  }
}
```

## 合

不得不说，chrome 对表单功能进行猜测，并以此提升用户体验确定给到我惊喜。但深入思考之后，我却不认为这是一个好的 idea，至少对于搜索行为的猜测。

回到 OpenSearch 上，总体而言，这个功能实现起来相当容易，除去 chrome 的自动探测不说，也算有两种通用的方法，开发量很小，而且对性能没什么影响。但实际上带的效果是因人而异的，至少对个人网站没什么用。我觉得并不是这个功能不好用，而是人们根本想不到用，这个使用习惯并没有建立。试想一下，如果你想在网站中搜索，以下两种搜索方式，你更习惯哪种：

![QQ20150605231843](./opensearch/QQ20150605231843.png)

我想更多人习惯直接用网页上提供的搜索功能。而且很多网站都将搜索功能 fixed 定位在页面上，访问便携。

对于 OpenSearch，我的观点是，它对于小网站其实是很鸡肋的；对于资讯信息类的大网站而言，还是有一定的价值，能稍许提升用户体验。好就好在开发量很小，大家都可以尝试尝试。
