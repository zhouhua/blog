---
title: 巧妙判断一个单词是否有重复字母
tags:
  - Javascript
  - 正则表达式
id: 384
category: 技术
layout: post
date: 2015-04-07 15:10:10
---

今天上午刷到一道题，大体是写一个方法判断一个单词中是否有重复的字母（或者说一个字符串中是否有重复的字符）。我的思路是一个字符一个字符地遍历，如果发现有重复的停止：</p>

<pre class="lang:js decode:true">function isIsogram(str) {
  str = str.toLowerCase();

  for (var i = 0; i &lt; str.length; i++) {
    if (str.indexOf(str.charAt(i), i + 1) &gt;= 0) {
      return false;
    }
  }

  return true;
}</pre>

这种简单的场景下谈性能没什么意义，两次循环速度并不慢（

<pre class="lang:js decode:1 inline:1 " >str.indexOf()</pre>

 也认为是一次循环，但由于是native的行为，速度很快）。

后来我看到了别的用正则的实现，虽然很简单，但一开始我确实没住这方面想：

<pre class="lang:js decode:true ">function isIsogram2(str) {
  return !/(.).*\1/i.test(str);
}</pre>

 或者：

<pre class="lang:js decode:true ">function isIsogram2(str) {
  return !/^.*(.).*\1/i.test(str);
}</pre>

 这两个其实没什么区别，前者优先查找字符串尾端，后者优先查找字符串前端。这个正则比较好理解，不多解释，比较让我惊讶的这个匹配的性能。因为判断一个字符串是否有重复字符这样的任务太简单，正因为太简单，所以代表目标字符串的规律性太小。如果用正则必然带来大量尝试和回溯，其实主观上会让人觉得性能很不好。不过好不好不是随便想一想就行的，还是要验证一下。决定性能到底是好是坏，当然看最坏情况下，两个算法的执行时间。构造这样一个单词：_qwertyuiopas_，没有字母重复，意味着两种算法都要跑完整的循环。

<pre class="lang:js decode:true">console.time("loop");
for(var i=0; i&lt;400000; i++){
    isIsogram("qwertyuiopas");
}
console.timeEnd("loop");

console.time("regexp");
for(var i=0; i&lt;400000; i++){
    isIsogram2("qwertyuiopas");
}
console.timeEnd("regexp");</pre>

 看看运行结果：

[![QQ20150407160509](http://www.zhouhua.info/wp-content/uploads/2015/04/QQ20150407160509.png)](http://www.zhouhua.info/wp-content/uploads/2015/04/QQ20150407160509.png)

amazing! 这个实验证实了一个问题：javascript对正则确实有优化，使用正则的效率非常高。当然这句话也可以反过来理解，javascript中的字符串操作、循环太慢了。那么，对于正则还等什么呢，赶快用起来吧。
