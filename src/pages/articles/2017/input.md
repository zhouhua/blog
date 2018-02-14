---
title: 征服number类型的input框
tags:
  - input
  - javascript
categories:
  - 技术
layout: post
date: 2017-11-01 10:00:00
---

在移动端H5页面开发中，有时候会有一些数值输入方面的需求。如果需要让用户比较方便地输入小数、负数，最简单的方式是使用number类型的input框，输入时软键盘会切换为数字键盘方便输入（ios是带数字的全键盘，并允许1e5这类的表示方法）。但是在实际使用的时候会面临一个问题，当输入的内容不合法时，比如输入了`1...2`，此时input会设置自己的状态为invalid，并把value清空。我们可以在css中通过`input:invalid`来为此input设置输入内容错误的样式，而在js一端，我们却无法知道用户输入的错误内容到底是什么。这个问题是dom本身的特性所置，与我们采用的开发框架无关，不管我们是使用angular、vue还是react，当number类型的input中输入不合法内容时，js就是没有办法知道错误内容是什么，也就没有办法帮助用户修正输入错误。

然而实际需求可不管这个，限制用户输入的数值范围、小数点后精度、是否允许负数等等都是很常见的需求。那怎么办呢？最近看到一篇文章做了一个很无可奈何，但确实很华丽的尝试：[一个数字键盘引发的血案——移动端H5输入框、光标、数字键盘全假套件实现](https://zhuanlan.zhihu.com/p/30360629)。有兴趣可以看一下，这篇文章实现了一个假的键盘来处理这些逻辑。在很复杂的交互和视觉需求下，做一个假键盘也不失为一个终极的解决方案。不过在我看来，处理数字格式、纠错等问题倒可以不用这么麻烦，下面我就分享一下我的思路。

设置一个目标吧：
1. 允许输入负数
2. 最多输入5位数
3. 最多允许两位小数
4. 自动清除多余的前置0
5. 自动补充纯小数的整数部分0

虽然定了这么多目标，归根到底只要能得到输入框的输入内容，剩下的就是简单的字符串处理了。那么如何能获取输入内容呢？我的方法是让浏览器选中输入框中所有的内容，然后获取浏览器中选中的字符串，最后清除选中状态。选中输入框中的内容有两种方法：
1. 最简单的是直接调用`input.select()`（[HTMLInputElement.select()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select)）；
2. 当输入框已经获得焦点的时候（当然），可以使用`document.execCommand('SelectAll')`来全选输入框中的所有内容([The selectAll command](https://w3c.github.io/editing/execCommand.html#the-selectall-command))。

然而实际上类型的为number的输入框是不允许操作selectRange的，虽然能选中内容，获取输入框中信息，但我在清除选中状态时遇到了问题（也许我代码写得不对），那么采用第二种方法。获取浏览器选中的字符串可以用`Window.getSelection().toString()`（[Window.getSelection()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection)）。得到实际输入的内容后，我们可以进行一系列的逻辑判断、数值更正。那么最后怎么再把正确的内容写回input框中，同时清除选中状态呢？方法也很多：

1. 把正确的内容写进clipboard，再粘贴到选中区域，主要使用`document.execCommand('copy')`和`document.execCommand('paste')`（[The copy command](https://w3c.github.io/editing/execCommand.html#the-copy-command)、[The paste command](https://w3c.github.io/editing/execCommand.html#the-paste-command)）；
2. 直接执行一次Undo操作，把输入框内容回退到上一次的正确结果（[The undo command](https://w3c.github.io/editing/execCommand.html#the-undo-command)）；
3. 执行insertText命令，在选中区域处插入新文本（[The insertText command](https://w3c.github.io/editing/execCommand.html#the-inserttext-command)）。

到这里基本上所需要的准备工作都已经完成，试着实践一下：

```html
<input type="number" id="input"/>
```

```javascript{7,20}
const input = document.querySelector('#input');

const format = /-?\d{0,5}(\.\d{0,2})?/;
let lastValue;

input.addEventListener('input', event => {
    document.execCommand('SelectAll');
    let text = window.getSelection().toString();
    if (lastValue !== text) {
        const match = text.match(format);
        if (!match) {
            text = '';
        }
        else {
            text = match[0]
                .replace(/^(-?)0+(\d)/, '$1$2') // 删除多余的前置0
                .replace(/^(-?)\./, '$10.'); // 插入纯小数的整数0
        }
        lastValue = text;
        document.execCommand('insertText', false, text);
    }
});
```

[Demo](https://jsbin.com/deqonurilu/edit?html,js,output)
