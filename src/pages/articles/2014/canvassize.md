---
title: canvas 元素的宽高
tags:
  - canvas
  - CSS
  - html5
  - Javascript
  - 椭圆
id: 202
category: 技术
layout: post
date: 2014-12-23 22:56:06
---

设置一个元素的尺寸，推荐的做法是通过css设置其 `width` 和 `height`。不过今天我们说说一个特例：**`canvas`**。本文内容比较简单，我不做示例。

常见的设置 `canvas` 元素尺寸有两种方法。

1. 给 `canvas` 元素设置属性，例如：

```html
<canvas width="400" height="400">
</canvas>
```

2. 给 `canvas` 对象设置属性，例如：

```javascript
var canvas = document.getElementById('canvas');
canvas.width = 400;
canvas.height = 400;
```

不过如果你采用css来控制：

```css
canvas {
    width:400px;
    height:400px;
}
```

则会发现 `canvas` 画出的图形变形了。为什么会这样？原来不同于其他元素，你只能通过前两种方式设置 `canvas` 的尺寸，因为 `canvas` 是基于像素点渲染的，它的渲染可以说完全依赖于 `imageData`，如果不通过 `canvas` 而直接改变 `canvas` 尺寸，那么 `imageData` 里的数据将完全无效。那么为什么用 css 设置宽高会发生变形呢？首先我们需要知道，通常一个未设置尺寸的 `canvas` 元素是有一个默认宽高的，为 300px &times; 150px，如果 css 中没有将宽高设置成 `canvas` 元素的宽高，那么这个它会在原有尺寸的基础上，拉伸到 css 中设置的尺寸。从这点上看，跟图片的宽高处理是一样的（只不过图片通过属性或 css 设置尺寸基本上效果是一样的）。

当然，通过 css 设置 `canvas` 的尺寸也并不一定是无用的，有害的。比如在画椭圆的时候，是不是又多了一种简单的途径？
