---
title: 判断回文字符串的新方法
tags:
  - Javascript
  - 正则
id: 352
category: 技术
layout: post
date: 2015-03-26 15:14:04
---

当年去携程面试时，刘大师问了一个判断回文字符串（类似于123454321）的方法，我是有备而来，刷刷就写了：

```javascript
function test(str) {
    return str.split('').reverse().join('') === str;
}
```

So easy。不过刘大师不喜欢这种 geek 范的东西，只好老老实实又写了一份循环版的……C++语言的……伪代码。还好当年不是技术面。

不过今天呢，我要尝试用第三种方法，当然必须是 javascript，来解决这个问题！

```javascript
function test(str) {
    var length = str.length;
    var regArrCenter = length % 2 === 0 ? [] : ['.'];
    var regArrLeft = ['^'];
    var regArrRight = ['$'];
    for (var i = 1; i <= length / 2; i++) {
        regArrLeft.push('(.)');
        regArrRight.unshift('\\' + i);
    }
    var regStr = regArrLeft.concat(regArrCenter, regArrRight).join('');
    var reg = new RegExp(regStr);
    return reg.test(str);
}
```

这个方法是通过回文字符串规律，构造正则表达式完成的，这个思路还是比较偏的。怎么说呢，有规律的地方就有正则。性能没考虑，估计跟循环法差不多，慢于数组操作。
