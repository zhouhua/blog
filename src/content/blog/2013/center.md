---
title: 网页中元素实现水平居中的方法
tags:
  - CSS
  - 水平居中
id: 20
category: 技术
hero: ./center.jpg
date: 2013-07-01 22:12:31
math: true
type: post
---

网页中元素居中的需求很普遍，今天就要谈谈相对比较简单，使用场合更多的水平居中。

## 行级元素居中

我们知道 css 中有一个 `text-align` 的属性来定义子元素的水平对齐，不过它仅对行级元素生效。一种思路就是我们将想要居中的元素规定成 `inline` 或 `inline-block` 元素。

```css
.parent {
  text-align: center;
  width: 100%;
}
.child {
  display: inline-block;
  width: 200px;
}
```

```html
<div class="parent">
  <div class="child">我要居中</div>
</div>
```

<div class="parent" style="text-align: center"><div class="child" style="display: inline-block;">我要居中</div></div>

注意，`inline-block` 在低版本 IE 和 firefox 中支持不佳，为了兼容低版本 IE，我们需要给所有的 `inline-block` 元素加上一段 hack：

```css
.inline-block {
  display: -moz-inline-stack;
  display: inline-block;
  *zoom: 1;
  _zoom: 1;
  *display: inline;
  _display: inline;
}
```

## margin自适应居中

`inline-block` 是一把双刃剑，虽然常常可以解决一些布局的难题，但兼容性问题很大。一方面建议开发者把上面我给出的 hack 代码放在 css 一个 class 中，如果在页面中要用到 `inline-block`，则给这个元素加上这个 class。不过不想用 inline-block 的话，还是有别的方法的，比如很多前端朋友都会用到的 `margin` 自适应居中。这是我见过最简单的方法，只需要给子元素设置左右 `margin` 为 `auto` 即可。原理很简单，当一个块级元素的左右 `margin` 为 `auto` 时，浏览器根据父元素和子元素的宽度计算出一个使其居中的左右 `margin`。

```css
.parent {
  width: 100%;
}
.child {
  margin: 0 auto;
  width: 100px;
}
```

```html
<div class="parent">
  <div class="child">我要居中</div>
</div>
```

<div class="parent" style="width: 100%;"><div class="child" style="margin: 0 auto; width: 100px;">我要居中</div></div>

注意，这个方法虽然很简单，但由于行级元素对 `margin` 不敏感，因而此方法仅能用于块元素，即 `inline`，`inline-block`，甚至 `inline-table` 的元素无法用此方法实现水平居中。

## 绝对定位

绝对定位也许是处理布局问题最有效的手段，但往往给人一种“暴力”的感觉。简单粗暴但高效的方法在编程时永远是最有价值的。那么绝对定位是如何做到水平居中的呢？我们知道，要对一个元素进行绝对定位，我们常常会规定它相对于 relative 元素的 `top`、`left`、`right`、`bottom` 中的一个或几个。很容易地，我们能想出，要让它能居中，我们可以设定 $left = (W - w) / 2 = W \times 50\% - w \times 50\%$，其中 $W$ 为 relative 元素（如父元素）的宽，$w$ 为居中元素的宽。不过有一个问题：css 中并不能进行这样的数值计算。不过这个问题有解，我们可以借助负 `margin` 值来解决这个问题，我们可以先设定 `left: 50%;` ，这时候元素是偏向右的，我们还需要让它左移自己宽度的一半。假设自身宽度为200px，那么我们可以规定：`margin-left: -100px`，请特别注意这里的负号！

```css
.parent {
  width: 100%;
  position: relative;
  height: 68px;
}
.child {
  position: absolute;
  left: 50%;
  margin-left: -50px;
  width: 100px;
}
```

```html
<div class="parent">
  <div class="child">我要居中</div>
</div>
```

<div class="parent" style="height: 68px; position: relative;"><div class="child" style="width: 100px; position: absolute; left: 50%; margin-left: -50px;">我要居中</div></div>

想必大家从我之前的说明里已经能看到这个方法的一点弊端了。对！这个方法要求我们必须先知道元素的宽度。对于动态的元素，如果我们无法事先得知元素的宽度，那么纯 CSS 无法解决这个问题，只能借助 javascript 获取宽度值后再更改 `margin-left` 的属性值。

<style>
.parent {
    width: 100%;
    max-width: 480px;
    margin: 20px auto 56px;
    background: #ccc;
    padding: 20px;
}
.child {
    text-align: center;
}
</style>
