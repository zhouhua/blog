---
title: javascript实现各种字符串搜索算法
tags:
  - Horspool算法
  - Javascript
  - KMP算法
  - 字符串搜索算法
  - 性能
  - 算法
categories:
  - 技术
  - javascript
layout: post
date: 2014-12-16 22:26:51
---

我觉得在前端开发中过多地考虑算法没有太多实际的意义。但这仅仅是我觉得，我并没有证据证明这一点。那为何不来尝试一下，面对一个特定的任务，我将使用不同的算法来实现，看看究竟效率相差多少。今天我想通过字符串搜索这一场景来进行测试。

## 测试场景

1. 主字符串就以ABC的一篇文章内容为例，略做修改

    > There are some times when clicking "like" on a friend's Facebook status doesn't feel appropriate. A bad day. A loved one lost. A break up. It only seems natural that a "dislike" button could solve the conundrum of wanting to empathize but not seem inappropriate by clicking "like." Mark Zuckerberg Puts the Rest of Us to Shame by Speaking Fluent Chinese. Mark Zuckerberg: Facebook Founder and Animal Butcher. Mark Zuckerberg and That Shirt. The idea has been on Mark Zuckerberg's radar for a while, he said. In 2010, he told ABC News' Diane Sawyer that that Facebook would "definitely think about" adding a dislike button. "People definitely seem to want it," Zuckerberg said. Four years later -- Zuckerberg says Facebook is still "thinking about" adding the oft-requested button, Zuckerberg says Facebook is still "thinking about" adding the oft-requested button. At a town hall meeting on Thursday, the CEO revealed he has some reservations about the feature. "There are two things that it can mean," Zuckerberg said of the potential button, which could be used in a mean spirited way or to express empathy. Finding how to limit it to the latter is the challenge. Zuckerberg said he doesn't want the button to turn into a "voting mechanism" or something that isn't "socially valuable." "Often people will tell us they don’t feel comfortable pressing 'like,'" Zuckerberg said. "What’s the right way to make it so people can easier express a wide range of emotions?" One suggestion percolating online: Roll out the feature under a different name. However, an "empathy button" just may not have the same ring to it as "dislike."

2.  模式字符串

    * 靠近起点`friend`
    * 靠近终点`button"`
    * 靠近中间`Zuckerberg says Facebook is still "thinking about" adding the oft-requested button.`

### 暴力算法

首先是最原始的做法，主串左侧开始，逐个对比，如果不相同，则主串起始点向后移一位，重复，直到找到。

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第一次尝试</caption>
<tbody>
<tr>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="gray">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td bgcolor="white">1</td>
<td bgcolor="white">2</td>
<td bgcolor="white">3</td>
<td bgcolor="white">4</td>
<td colspan="20" align="left"> </td>
</tr>
<tr>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="gray">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td colspan="16" bgcolor="white"> </td>
</tr>
</tbody>
</table>

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第二次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="gray">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="1" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td colspan="22" align="left"> </td>
</tr>
<tr>
<td colspan="1" bgcolor="white"> </td>
<td bgcolor="gray">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td colspan="15" bgcolor="white"> </td>
</tr>
</tbody>
</table>

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第三次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="gray">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="2" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td colspan="21" align="left"> </td>
</tr>
<tr>
<td colspan="2" bgcolor="white"> </td>
<td bgcolor="gray">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td colspan="14" bgcolor="white"> </td>
</tr>
</tbody>
</table>

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第四次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="gray">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="3" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td colspan="20" align="left"> </td>
</tr>
<tr>
<td colspan="3" bgcolor="white"> </td>
<td bgcolor="gray">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td colspan="13" bgcolor="white"> </td>
</tr>
</tbody>
</table>

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第五次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="gray">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="4" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td colspan="19" align="left"> </td>
</tr>
<tr>
<td colspan="4" bgcolor="white"> </td>
<td bgcolor="gray">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td colspan="12" bgcolor="white"> </td>
</tr>
</tbody>
</table>

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">Sixth attempt</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="5" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td bgcolor="white">2</td>
<td bgcolor="white">3</td>
<td bgcolor="white">4</td>
<td bgcolor="white">5</td>
<td bgcolor="white">6</td>
<td bgcolor="white">7</td>
<td bgcolor="white">8</td>
<td colspan="11" align="left"> </td>
</tr>
<tr>
<td colspan="5" bgcolor="white"> </td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td colspan="11" bgcolor="white"> </td>
</tr>
</tbody>
</table>

以上示例（[http://igm.univ-mlv.fr/~lecroq/string/examples/exp3.html](http://igm.univ-mlv.fr/~lecroq/string/examples/exp3.html "暴力搜索")）说明了一次暴力搜索的过程。

我用JS模拟了这个算法：

`var mainString="";
var searchString=""
function basicSearch(mainStr, str, offset){
    var mainLength=mainStr.length;
    var searchLength=str.length;
    if(searchLength>mainLength-offset){
        return -1;
    }
    offset=offset||0;
    for(var i=0;searchlength>i ;i++){
        if(str.charAt(i)!==mainString.charAt(offset+i)){
            return basicSearch(mainStr, str, offset+1)
        }
    }
    return offset;
}
basicSearch(mainString, searchString);`

<pre class="lang:js decode:true" title="暴力算法非递归版">function basicSearchLoop(mainStr, str){
    var mainLength=mainStr.length;
    var searchLength=str.length;
    for(var offset= 0,padding=mainLength-searchLength;offset< =padding;offset++) {
        var match=true;
        for (var i = 0; i < searchLength; i++) {
            if (str.charAt(i) !== mainString.charAt(offset + i)) {
                match=false;
                break;
            }
        }
        if(match)return offset;
    }
    return -1;
}</pre>

&nbsp;

## KMP算法（Knuth-Morris-Pratt算法）

KMP算是字符串搜索算法里的明星。不过本文重点不是介绍算法历史，有兴趣的可以移步百度百科（[KMP算法](http://baike.baidu.com/view/659777.htm "KMP算法")）。这里一样先看一个例子：

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第一次尝试</caption>
<tbody>
<tr>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="gray">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td bgcolor="white">1</td>
<td bgcolor="white">2</td>
<td bgcolor="white">3</td>
<td bgcolor="white">4</td>
<td colspan="20" align="left"> </td>
</tr>
<tr>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="gray">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td colspan="16" bgcolor="white"> </td>
</tr>
</tbody>
</table>

移动步数: 4 (_i_-_kmpNext_[_i_]=3- -1)

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第二次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="gray">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="4" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td colspan="19" align="left"> </td>
</tr>
<tr>
<td colspan="4" bgcolor="white"> </td>
<td bgcolor="gray">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td colspan="12" bgcolor="white"> </td>
</tr>
</tbody>
</table>

移动步数: 1 (_i_-_kmpNext_[_i_]=0- -1)

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第三次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="5" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td bgcolor="white">2</td>
<td bgcolor="white">3</td>
<td bgcolor="white">4</td>
<td bgcolor="white">5</td>
<td bgcolor="white">6</td>
<td bgcolor="white">7</td>
<td bgcolor="white">8</td>
<td colspan="11" align="left"> </td>
</tr>
<tr>
<td colspan="5" bgcolor="white"> </td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td colspan="11" bgcolor="white"> </td>
</tr>
</tbody>
</table>

移动步数: 7 (_i_-_kmpNext_[_i_]=8-1)

如果每次发生不一致都要计算一次效率太低，可以考虑将计算结果缓存到一张**部分匹配表**中（也可以在搜索之前先生成此表）。以intristed为例：移动步数: 1 (_i_-_kmpNext_[_i_]=0- -1)

[原始示例出处](http://igm.univ-mlv.fr/~lecroq/string/examples/exp8.html "KMP算法")。我们看到，这里有一个

`kmpNext`

 数组，这是什么呢？我们慢慢来理解。每一次尝试匹配时，从模式字符串的左端开始对比，如果第i个字符相同，则比较第i+1个；如果不相同，则需要把模式字符串向右移动。移动的位数是算法优劣的关键。每次移动一位是暴力算法的做法。kmp算法有自己独特的移动步数计算方法。

首先引入两个概念：**前缀**和**后缀**。

*   前缀：一个字符串所有头部的集合，不包含自身；
*   后缀：一个字符串所有尾部的集合，不包含自身。

我们看下面的例子（编号从1开始编）：

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<tbody>
<tr>
<td bgcolor="lightgrey">i</td>
<td bgcolor="lightgrey">n</td>
<td bgcolor="lightgrey">t</td>
<td bgcolor="lightgrey">r</td>
<td bgcolor="lightgrey">i</td>
<td bgcolor="lightgrey">s</td>
<td bgcolor="lightgrey">t</td>
<td bgcolor="gray">i</td>
<td bgcolor="antiquewhite">n</td>
<td bgcolor="antiquewhite">g</td>
</tr>
<tr>
<td bgcolor="white">1</td>
<td bgcolor="white">2</td>
<td bgcolor="white">3</td>
<td bgcolor="white">4</td>
<td bgcolor="white">5</td>
<td bgcolor="white">6</td>
<td bgcolor="white">7</td>
<td bgcolor="white">8</td>
<td bgcolor="white">9</td>
<td bgcolor="white"> </td>
</tr>
<tr>
<td bgcolor="lightgrey">i</td>
<td bgcolor="lightgrey">n</td>
<td bgcolor="lightgrey">t</td>
<td bgcolor="lightgrey">r</td>
<td bgcolor="lightgrey">i</td>
<td bgcolor="lightgrey">s</td>
<td bgcolor="lightgrey">t</td>
<td bgcolor="gray">e</td>
<td bgcolor="antiquewhite">d</td>
<td> </td>
</tr>
</tbody>
</table>

在模式串8的位置发生了不匹配，那么要计算模式串右移的位数之前，我们先写出位置1~7处的子串intrist的前缀和后缀：

*   前缀：i, in, int, intr, intri, intris, intrist
*   后缀：t, st, ist, rist, trist, ntrist, intrist

我们再定义一个**部分匹配值**的概念：前缀和后缀交集中，长度最长的元素的长度。很显然，这里前缀和后缀没有交集，最长共同元素的长度也就认为是0，那么模式串向右移动（8-0=）8个字符。跟上面的算法（上面是7-(-1)）稍有不同，不过大体意思一样，计算结果也一样。

<table>
<caption>部分匹配表</caption>
<tbody>
<tr>
<th>模式字符串</th>
<td>i</td>
<td>n</td>
<td>t</td>
<td>r</td>
<td>i</td>
<td>s</td>
<td>t</td>
<td>e</td>
<td>d</td>
</tr>
<tr>
<th>序号</th>
<td>1</td>
<td>2</td>
<td>3</td>
<td>4</td>
<td>5</td>
<td>6</td>
<td>7</td>
<td>8</td>
<td>9</td>
</tr>
<tr>
<th>部分匹配值</th>
<td>0</td>
<td>0</td>
<td>0</td>
<td>0</td>
<td>1</td>
<td>0</td>
<td>0</td>
<td>0</td>
<td>0</td>
</tr>
</tbody>
</table>

计算右移位数就可以很容易地从表中计算出来：

> 移动位数=已匹配的位数-已匹配部分的部分匹配值

例如在第6个位置s处发现不匹配，那么需要右移5-1=4位。

但这样计算其实并不方便，比如已匹配位数为0的情况很难处理，所以我们可以对部分匹配值做一个修正，每个值减去1，公式也相应调整为：

> 移动位数=不匹配字符的位置-已匹配部分的修正部分匹配值

这样这个公式就与上面示例中的公式相同了。

我用JS模拟了这个算法：

</pre>

<pre class="lang:js decode:true" title="KMP算法">function KMPSearch(mainLength,str,offset,group){
    var mainLength=mainString.length;
    var searchLength=str.length;
    if(searchLength>mainLength-offset){
        return -1;
    }
    offset=offset||0;
    group=group||[1,1];
    var searchedString=[];
    for(var i=0;searchlength>i ;i++){
        var searchingChar=str.charAt(i);
        if(searchingChar!==mainString.charAt(offset+i)){
            var offsetJump;
            if(group[i]) {
                offsetJump = group[i];
            }else{
                offsetJump = next(searchedString);
                group[i]=offsetJump;
            }
            return KPMSearch(mainLength,str,offset+offsetJump,group);
        }
        searchedString.push(searchingChar);
    }
    return offset;
}
function next(chars){
    var length=chars.length;
    for(var i=length-1;i>0;i--){
        var isMatch=true;
        for(var j=0 ;j< =i;j++){
            if(chars[j]!==chars[length-i+j]){
                isMatch=false;
                break;
            }
        }
        if(isMatch)return length-i;
    }
    return length;
}</pre>

&nbsp;

</pre>

<pre class="lang:js decode:true " title="KMP算法非递归版本">function KMPSearchLoop(mainStr, str) {
    var mainLength=mainString.length;
    var searchLength = str.length;
    for (var offset = 0, padding = mainLength - searchLength, group = [1, 1]; offset < = padding;){
        var searchedString = [];
        var match=true;
        var offsetJump;
        for (var i = 0; i < searchLength; i++) {
            var searchingChar = str.charAt(i);
            if (searchingChar !== mainString.charAt(offset + i)) {
                match=false;
                if (group[i]) {
                    offsetJump = group[i];
                }
                else {
                    offsetJump = next(searchedString);
                    group[i] = offsetJump;
                }
                break;
            }
            searchedString.push(searchingChar);
        }
        if(match){
            return offset;
        }else{
            offset+=offsetJump;
        }
    }
    return -1;
}</pre>

&nbsp;

## Horspool算法

Horspool算法在做匹配的时候，创造性地从右向左匹配，对后来其他算法有很深的影响。还是那句话，本文会讲很多算法上的东西，但本文重点不是算法，下面还是会过一下Horspool算法的搜索过程，如果难以理解，还是参考其他更详细的资料。依然是示例（[http://igm.univ-mlv.fr/~lecroq/string/examples/exp18.html](http://igm.univ-mlv.fr/~lecroq/string/examples/exp18.html "Horspool算法")）：

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第一次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="gray">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="7" bgcolor="white"> </td>
<td bgcolor="white">1</td>
<td colspan="16" align="left"> </td>
</tr>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="gray">G</td>
<td colspan="16" bgcolor="white"> </td>
</tr>
</tbody>
</table>

移动步数: 1 (Horspool[A])

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第二次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="gray">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="1" bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white">3</td>
<td bgcolor="white">2</td>
<td bgcolor="white">1</td>
<td colspan="15" align="left"> </td>
</tr>
<tr>
<td colspan="1" bgcolor="white"> </td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="gray">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td colspan="15" bgcolor="white"> </td>
</tr>
</tbody>
</table>

移动步数: 2 (Horspool[G])

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第三次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="gray">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="3" bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white"> </td>
<td bgcolor="white">5</td>
<td bgcolor="white">4</td>
<td bgcolor="white">3</td>
<td bgcolor="white">2</td>
<td bgcolor="white">1</td>
<td colspan="13" align="left"> </td>
</tr>
<tr>
<td colspan="3" bgcolor="white"> </td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="gray">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td colspan="13" bgcolor="white"> </td>
</tr>
</tbody>
</table>

移动步数: 2 (Horspool[G])

<table border="0" summary="search" cellspacing="0" cellpadding="5">
<caption align="left">第四次尝试</caption>
<tbody>
<tr>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">G</td>
<td bgcolor="antiquewhite">T</td>
<td bgcolor="antiquewhite">A</td>
<td bgcolor="antiquewhite">C</td>
<td bgcolor="antiquewhite">G</td>
</tr>
<tr>
<td colspan="5" bgcolor="white"> </td>
<td bgcolor="white">8</td>
<td bgcolor="white">7</td>
<td bgcolor="white">6</td>
<td bgcolor="white">5</td>
<td bgcolor="white">4</td>
<td bgcolor="white">3</td>
<td bgcolor="white">2</td>
<td bgcolor="white">1</td>
<td colspan="11" align="left"> </td>
</tr>
<tr>
<td colspan="5" bgcolor="white"> </td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">C</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td bgcolor="lightgrey">A</td>
<td bgcolor="lightgrey">G</td>
<td colspan="11" bgcolor="white"> </td>
</tr>
</tbody>
</table>

先对齐，从模式串的右侧开始匹配，如果完全匹配则结束搜索，否则查看模式串最右边对应的主串字符是什么。找出这个字符在模式串中最后出现的位置（除最末位）距离模式串最后一个字符的距离，如果没有在模式串中出现过，则认为这个距离是模式串的长度。我们可以事先把这个距离表计算出来。

<table style="width: 300px; height: 40px;">
<tbody>
<tr>
<td>7</td>
<td>6</td>
<td>5</td>
<td>4</td>
<td>3</td>
<td>2</td>
<td>1</td>
<td> </td>
</tr>
<tr>
<td>G</td>
<td>C</td>
<td>A</td>
<td>G</td>
<td>A</td>
<td>G</td>
<td>A</td>
<td>G</td>
</tr>
</tbody>
</table>

⇒

<table style="width: 300px;">
<tbody>
<tr>
<td>字符</td>
<td>G</td>
<td>C</td>
<td>A</td>
<td>*（其他）</td>
</tr>
<tr>
<td>距离</td>
<td>2</td>
<td>6</td>
<td>1</td>
<td>8（模式串的长度）</td>
</tr>
</tbody>
</table>

以上面第三次尝试为例，从右向左匹配了5次后发现匹配失败了，那么这时就看序号1处主串的字符是什么。很容易得到是‘G’，查询上表，‘G’对应的距离是2，那就很简单粗暴地把模式串向右移动两位，再次进行匹配。

上代码：

</pre>

<pre class="lang:js decode:true " title="Horspool算法非递归版" >function HorspoolSearchLoop(mainString, str){
    var mainLength=mainString.length;
    var searchLength = str.length;
    var table={};
    for(var index= 0,l=searchLength-1;l>index ;index++){
        table[str.charAt(index)]=l-index;
    }
    for (var offset = 0, padding = mainLength - searchLength; offset < = padding;){
        var rightChar;
        var match=true;
        var offsetJump;
        for (var i = searchLength-1; i >=0; i--) {
            var searchingChar = str.charAt(i);
            if(i===searchLength-1){
                rightChar=mainString.charAt(offset+i);
            }
            if (searchingChar !== mainString.charAt(offset + i)) {
                match=false;
                offsetJump = table[rightChar]||searchLength;
                break;
            }
        }
        if(match){
            return offset;
        }else{
            offset+=offsetJump;
        }
    }
    return -1;
}</pre>

 这次只写了非递归的版本，因为递归的版本已经没有写的必要。

## 还是来谈javascript

冲着javascript性能来看这篇文章的同学一定没有兴趣看上来的算法。我一边写一边测试，终于也不愿意再深究其他的一些算法，原本还想把Boyer-Moore算法、Sunday算法也一起讨论讨论，现在看来完全没有必要。为什么？因为javascript实现这些算法的效率实在太！慢！了！

回到开头我们设置的测试场景，我们分别来试验一下搜索10000次，各种算法所要耗费的时间。

<table>
<tbody>
<tr>
<td> </td>
<td>递归版（<span class="_calcRound">10000</span>次·ms）</td>
<td>循环版（<span class="_calcRound">10000</span>次·ms）</td>
</tr>
<tr>
<td>暴力算法</td>
<td class="_basicSearch">87, 1862, 990</td>
<td class="_basicSearchLoop">35, 1349, 661</td>
</tr>
<tr>
<td>KMP算法</td>
<td class="_KPMSearch">106, 3405, 1770</td>
<td class="_KPMSearchLoop">76, 2337, 1194</td>
</tr>
<tr>
<td>Horspool算法</td>
<td colspan="2" class="_HorspoolSearchLoop">187, 2479, 1446</td>
</tr>
<tr>
<td>javascript原生方法</td>
<td colspan="2" class="_NativeSearch">9, 101, 47</td>
</tr>
</tbody>
</table>

自己动手试验一下？<label>运行次数：<input type="text" class="_times" value="10000"/></label><button class="_run">运行</button>

我想从数据上看，结论是很清晰的。javascript代码的性能确实不高，相比较于循环，递归更是慢了近1倍。javascript在分配内存，数组访问，函数调用等等方面的性能与编译型语言差距很大。如果要实现一个特定的任务，我们更多地应该考虑尽可能地使用原生代码来实现，高级的算法在javascript里似乎并没有多少实用价值。
