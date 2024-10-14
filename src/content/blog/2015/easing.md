---
title: 学写 jquery 缓动函数
tags:
  - animate
  - css3
  - Javascript
  - 动画
  - 缓动函数
id: 270
hero: ./easing.jpg
category: 技术
type: post
date: 2015-03-10 16:31:50
---

问题引入：实现如下效果

<div id="container">
    <div id="first"></div>
    <div id="second"></div>
</div>

两个方块的追逐效果，使用 css3，实现起来没什么难度：

```html
<div id="container">
  <div id="first"></div>
  <div id="second"></div>
</div>
```

```css
#container {
  position: relative;
  width: 320px;
  height: 320px;
  border: 1px solid #ccc;
}

@-webkit-keyframes run {
  0% {
    left: 0;
    top: 0;
  }
  25% {
    left: 220px;
    top: 0;
  }
  50% {
    left: 220px;
    top: 220px;
  }
  75% {
    left: 0;
    top: 220px;
  }
  100% {
    left: 0;
    top: 0;
  }
}
@keyframes run {
  0% {
    left: 0;
    top: 0;
  }
  25% {
    left: 220px;
    top: 0;
  }
  50% {
    left: 220px;
    top: 220px;
  }
  75% {
    left: 0;
    top: 220px;
  }
  100% {
    left: 0;
    top: 0;
  }
}

#first {
  width: 100px;
  height: 100px;
  background: orange;
  position: absolute;
  -webkit-animation: run 1.6s 0.8s infinite;
  animation: run 1.6s 0.8s infinite;
}

#second {
  width: 100px;
  height: 100px;
  background: red;
  position: absolute;
  -webkit-animation: run 1.6s infinite;
  animation: run 1.6s infinite;
}
```

用到了 css3 的 animate 属性，不是很复杂。不过出于兼容性的考虑，我们决定使用 jquery 的 animate 方法来重新实现。

## 简单粗暴地多次使用 $.animate

可以看到，每个方块的运动都可以分解成四步，每一步都是向一个方向运动。于是如果要用 `$.animate` 来实现，可以在一个循环里，依次调用四遍 `$.animate` 来实现：

```css
#container {
  position: relative;
  width: 320px;
  height: 320px;
  border:1px solid #ccc;
}

#first {
  width: 100px;
  height: 100px;
  background: orange;
  position: absolute;
  left: 0;
  top: 0;
}

#second {
  width: 100px;
  height: 100px;
  background: red;
  position: absolute;
  right:0;
  bottom:0;
}
```

```javascript
const $first = $('#first');
const $second = $('#second');

(function firstMove() {
  $first.animate(
    {
      left: 220,
      top: 0
    },
    400,
    'linear',
    () => {
      $first.animate(
        {
          left: 220,
          top: 220
        },
        400,
        'linear',
        () => {
          $first.animate(
            {
              left: 0,
              top: 220
            },
            400,
            'linear',
            () => {
              $first.animate(
                {
                  left: 0,
                  top: 0
                },
                400,
                'linear',
                () => {
                  firstMove();
                }
              );
            }
          );
        }
      );
    }
  );
})();

(function secondMove() {
  $second.animate(
    {
      bottom: 0,
      right: 220
    },
    400,
    'linear',
    () => {
      $second.animate(
        {
          bottom: 220,
          right: 220
        },
        400,
        'linear',
        () => {
          $second.animate(
            {
              bottom: 220,
              right: 0
            },
            400,
            'linear',
            () => {
              $second.animate(
                {
                  bottom: 0,
                  right: 0
                },
                400,
                'linear',
                () => {
                  secondMove();
                }
              );
            }
          );
        }
      );
    }
  );
})();
```

这种实现简单粗暴。我写的这段代码回调链太深了，不好看。有比我更熟悉 jquery 的朋友不使用 complete 回调，而是直接 `$.animate().animate()` 这样的调用链，效果一样，代码会短很多。不过 jquery 代码美化优化什么的不是今天的重点。重点是什么？学习缓动函数。

## 缓动函数（animation easing）

缓动函数是用来描述动画效果，在 jquery 中，实现了两种，分别是 `linear` 和 `swing`。`linear` 效果就是没有效果，动画速度是均匀的，呈线性变化。`swing` 呢，动画效果呈线慢-快-慢的变化。`swing` 也是 `$.animate` 的默认动画效果。

或许仅仅这么说还是难以让人理解缓动函数在干什么，那就参考一下下面来自 jquery ui 的例子：

<iframe style="height:600px;width:100%" src="http://easings.net/zh-cn" class="demo-frame"></iframe>

或者参考 [jquery easing plugin](http://gsgd.co.uk/sandbox/jquery/easing/)。

回到 jquery ui 提供的各个缓动函数示意图上，对于任意一张示意图，横向表示时间，纵向表示动画变化量。当斜率越大时，表示此时动画速率越快。

我们定义几个变量和常量来标记一下：动画起始变化量为 $begin$，为方便计算，定义为常数0；动画结束和起始时的变化差值（总变化量）$change$，为方便计算，定义为常数1；动画持续时间 $duration$；动画已进行时间 $currentTime$；动画进行的进度 $progress$，它等同于 $currentTime / duration$；当前变化量 $eased$，jquery 中这样定义：

$$
eased = easingFunction(progress, currentTime, begin=0, change=1, duration);
$$

从上面的效果中随便挑一个出来看看是如何实现的吧：

```javascript
function easeOutBounce(progress, currentTime, begin, change, duration) {
  if ((currentTime /= duration) < 1 / 2.75) {
    return change * (7.5625 * currentTime * currentTime) + begin;
  }
  else if (currentTime < 2 / 2.75) {
    return change * (7.5625 * (currentTime -= 1.5 / 2.75) * currentTime + 0.75) + begin;
  }
  else if (currentTime < 2.5 / 2.75) {
    return change * (7.5625 * (currentTime -= 2.25 / 2.75) * currentTime + 0.9375) + begin;
  }
  else {
    return change * (7.5625 * (currentTime -= 2.625 / 2.75) * currentTime + 0.984375) + begin;
  }
}
```

说到这儿，我想该插一点相关话题。熟悉 css3 的朋友会知道，css3 的动画也有缓动函数，不过换了个名字，叫 _timing function_。在 transition 中是 `transition-timing-function`，在 animate 里是 `animate-timing-function`。主要支持的动画有 ease、linear、ease-in、ease-out、ease-in-out 等。那如果想要的动画不在浏览器默认支持的列表中怎么办？css3 也是支持自定义 timing-function 的，不过不同于 jquery 的 easing function，timing function 并不是描述特定时间下的动画量，而是直接描述上面我们看到的曲线图。timing function 允许使用三次贝塞尔曲线方程描述动画曲线。三次贝塞尔方程接受4个点的参数：

```javascript
cubic - bezier(P0, P1, P2, P3);
```

但在 css 的 timing function 场景下，P0 点就是(0, 0)，P3 点就是(1, 1)。于是变量就只剩下两个点的坐标，调用方式就变成了：

```javascript
cubic - bezier(P1x, P1y, P2x, P2y);
```

在 W3C 的规范中，定义了这四个点的纵横坐标都需要在0和1之间，这也就意味着无论怎么变化，曲线上所有的点都必须在这个1\*1的正方形内，对比上面 jquery ui easing 的曲线图，我们可以确认像 elastic 这类的效果，使用 timing-function 就无能为力了。

想多了解一下 css3 的 timing function，不妨到[这个网站](http://cubic-bezier.com/)上自己动手试验一下。

## 编写 easing function

说了半天的 timing function，终于又回到 easing function 上来了。自己动手写 easing function，那自由度，无边无际。从上面的介绍中，我们往往会有这样一个错觉，progress = 0 时，eased = 0；progress = 1 时，eased = 1。timing function 中，因为 P0 和 P3 是定死的，所以这条一定成立，但在easing function中，其实并没有这个限制。

什么意思？以我们开篇的动画为例，我们看一个方块从左上角运动一圈的轨迹。先说水平方向上，progress < 0.25 时，left 属性从 0px 变成 220px；0.25 <= progress < 0.5 时，left 保持 220px；0.5 <= progress < 0.75 时，left 属性从 220px 变成 0px；0.75 <= progress < 1时，left 保持 0px。再看竖直方向上，progress < 0.25 时，top 保持 0px；0.25 <= progress < 0.5 时，top 从 0px 变成 220px；0.5 <= progress < 0.75 时，top 保持 220px；0.75 <= progress < 1 时，top 从 220px 变成 0px。那么这个过程反映成 easing function 就是：

```javascript
function horizontal(progress) {
  if (progress < 0.25) {
    return progress * 4;
  }
  else if (progress < 0.5) {
    return 1;
  }
  else if (progress < 0.75) {
    return (0.75 - progress) * 4;
  }
  return 0;
}
function vertical(progress) {
  if (progress < 0.25) {
    return 0;
  }
  else if (progress < 0.5) {
    return (progress - 0.25) * 4;
  }
  else if (progress < 0.75) {
    return 1;
  }
  return (1 - progress) * 4;
}
```

接下来扩展 jquery 的 easing 效果库：

```javascript
$.extend($.easing, {
  horizontal,
  vertical
});
```

在$.animate中就可以像linear或者swing那样使用了：

```javascript
(function firstMove() {
  $first.animate(
    {
      left: 220,
      top: 220
    },
    {
      complete() {
        firstMove();
      },
      duration: 1600,
      specialEasing: {
        left: 'horizontal',
        top: 'vertical'
      }
    }
  );
})();
(function secondMove() {
  $second.animate(
    {
      left: 0,
      top: 0
    },
    {
      complete() {
        secondMove();
      },
      duration: 1600,
      specialEasing: {
        left: 'horizontal',
        top: 'vertical'
      }
    }
  );
})();
```

我们通过 specialEasing 这个参数为水平方向和竖直方向指定了不同的动画效果。当然了，在这个场景中，自己写缓动函数并没有降低整体的复杂度，毕竟这个缓动函数逻辑太碎，理解起来肯定比四个 animate 连起来的方式复杂。但我希望能给大家带来一些思路上的启示，为以后可能遇到的问题积累经验。

<style>
#container {
  position: relative;
  width: 320px;
  height: 320px;
  border:1px solid #ccc;
  margin: 0 auto;
}

@-webkit-keyframes run {
  0% {
    left:0;
    top:0;
  }
  25% {
    left:220px;
    top:0;
  }
  50% {
    left:220px;
    top:220px;
  }
  75% {
    left:0;
    top:220px;
  }
  100% {
    left:0;
    top:0;
  }
}
@keyframes run {
  0% {
    left:0;
    top:0;
  }
  25% {
    left:220px;
    top:0;
  }
  50% {
    left:220px;
    top:220px;
  }
  75% {
    left:0;
    top:220px;
  }
  100% {
    left:0;
    top:0;
  }
}

#first {
  width: 100px;
  height: 100px;
  background: orange;
  position: absolute;
  -webkit-animation: run 1.6s 0.8s infinite;
  animation: run 1.6s 0.8s infinite;
}

#second {
  width: 100px;
  height: 100px;
  background: red;
  position: absolute;
  -webkit-animation: run 1.6s infinite;
  animation: run 1.6s infinite;
}
</style>
