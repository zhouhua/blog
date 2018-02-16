---
title: 学写jquery缓动函数
tags:
  - animate
  - css3
  - Javascript
  - 动画
  - 缓动函数
id: 270
category: 技术
layout: post
date: 2015-03-10 16:31:50
---

问题引入：实现如下效果

<div id="container">
<div id="first"></div>
<div id="second"></div>
</div>

两个方块的追逐效果，使用css3，实现起来没什么难度：

<pre class="lang:xhtml decode:true " title="HTML结构"><div id="container">
    <div id="first"></div>
    <div id="second"></div>
</div></pre>

<pre class="lang:css decode:true" title="CSS">#container{
  position: relative;
  width: 320px;
  height: 320px;
  border:1px solid #ccc;
}

@-webkit-keyframes run{
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
@keyframes run{
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

#first{
  width: 100px;
  height: 100px;
  background: orange;
  position: absolute;
  -webkit-animation: run 1.6s 0.8s infinite;
  animation: run 1.6s 0.8s infinite;
}

#second{
  width: 100px;
  height: 100px;
  background: red;
  position: absolute;
  -webkit-animation: run 1.6s infinite;
  animation: run 1.6s infinite;
}</pre>

用到了css3的animate属性，不是很复杂。不过出于兼容性的考虑，我们决定使用jquery的animate方法来重新实现。

## 简单粗暴地多次使用$.animate

可以看到，每个方块的运动都可以分解成四步，每一步都是向一个方向运动。于是如果要用`$.animate`来实现，可以在一个循环里，依次调用四遍`$.animate`来实现：

<pre class="lang:css decode:true " title="CSS" >#container{
  position: relative;
  width: 320px;
  height: 320px;
  border:1px solid #ccc;
}

#first{
  width: 100px;
  height: 100px;
  background: orange;
  position: absolute;
  left: 0;
  top: 0;
}

#second{
  width: 100px;
  height: 100px;
  background: red;
  position: absolute;
  right:0;
  bottom:0;
}</pre>

<pre class="lang:js decode:true " title="javascript" >    var $first=$('#first');
    var $second=$('#second');

    (function firstMove(){
        $first.animate({
            "left":220,
            "top": 0,
        },400,"linear",function(){
            $first.animate({
                "left":220,
                "top":220
            },400,"linear",function(){
                $first.animate({
                    "left":0,
                    "top":220
                },400,"linear",function(){
                    $first.animate({
                        "left":0,
                        "top":0
                    },400,"linear",function(){
                        firstMove();
                    });
                });
            });
        });
    })();

    (function secondMove(){
        $second.animate({
            "right":220,
            "bottom":0
        },400,"linear",function(){
            $second.animate({
                "right":220,
                "bottom":220
            },400,"linear",function(){
                $second.animate({
                    "right":0,
                    "bottom":220
                },400,"linear",function(){
                    $second.animate({
                        "right":0,
                        "bottom":0
                    },400,"linear",function(){
                        secondMove();
                    });
                });
            });
        });
    })();</pre>

这种实现简单粗暴。我写的这段代码回调链太深了，不好看。有比我更熟悉jquery的朋友不使用complete回调，而是直接$.animate().animate()这样的调用链，效果一样，代码会短很多。不过jquery代码美化优化什么的不是今天的重点。重点是什么？学习缓动函数。

## 缓动函数（animation easing）

缓动函数是用来描述动画效果，在jquery中，实现了两种，分别是

<pre class="inline:true decode:1 " >linear</pre>

和

<pre class="inline:true decode:1 " >swing</pre>

。

<pre class="inline:true decode:1 " >linear</pre>

效果就是没有效果，动画速度是均匀的，呈线性变化。

<pre class="inline:true decode:1 " >swing</pre>

呢，动画效果呈线慢-快-慢的变化。

<pre class="inline:true decode:1 " >swing</pre>

也是$.animate的默认动画效果。

或许仅仅这么说还是难以让人理解缓动函数在干什么，那就参考一下下面来自jquery ui的例子：

<iframe style="width:100%;height:600px;" src="http://jqueryui.com/resources/demos/effect/easing.html" class="demo-frame"></iframe>

或者参考[jquery easing plugin](http://gsgd.co.uk/sandbox/jquery/easing/)。

回到jquery ui提供的各个缓动函数示意图上，对于任意一张示意图，横向表示时间，纵向表示动画变化量。当斜率越大时，表示此时动画速率越快。

我们定义几个变量和常量来标记一下：动画起始变化量为_begin_，为方便计算，定义为常数0；动画结束和起始时的变化差值（总变化量）_change_，为方便计算，定义为常数1；动画持续时间_duration_；动画已进行时间_currentTime_；动画进行的进度_progress_，它等同于

<pre class="lang:js decode:1 inline:1 " >currentTime / duration</pre>

；当前变化量_eased_，jquery中这样定义：

<pre class="lang:js decode:true " title="easing定义" >eased = easingFunction(progress, currentTime, begin=0, change=1, duration);</pre>

从上面的效果中随便挑一个出来看看是如何实现的吧：

<pre class="lang:js decode:true " title="easeOutBounce的实现" >function easeOutBounce(progress, currentTime, begin, change, duration) {
    if ((currentTime/=duration) < (1/2.75)) {
        return change*(7.5625*currentTime*currentTime) + begin;
    } else if (currentTime < (2/2.75)) {
        return change*(7.5625*(currentTime-=(1.5/2.75))*currentTime + .75) + begin;
    } else if (currentTime < (2.5/2.75)) {
        return change*(7.5625*(currentTime-=(2.25/2.75))*currentTime + .9375) + begin;
    } else {
        return change*(7.5625*(currentTime-=(2.625/2.75))*currentTime + .984375) + begin;
    }
}</pre>

说到这儿，我想该插一点相关话题。熟悉css3的朋友会知道，css3的动画也有缓动函数，不过换了个名字，叫_timing function_。在transition中是transition-timing-function，在animate里是animate-timing-function。主要支持的动画有ease、linear、ease-in、ease-out、ease-in-out等。那如果想要的动画不在浏览器默认支持的列表中怎么办？css3也是支持自定义timing-function的，不过不同于jquery的easing function，timing function并不是描述特定时间下的动画量，而是直接描述上面我们看到的曲线图。timing function允许使用三次贝塞尔曲线方程描述动画曲线。三次贝塞尔方程接受4个点的参数：

<pre class="lang:js decode:true " title="三次贝塞尔方程" >cubic-bezier(P0, P1, P2, P3)</pre>

但在css的timing function场景下，P0点就是(0, 0)，P3点就是(1, 1)。于是变量就只剩下两个点的坐标，调用方式就变成了：

<pre class="lang:js decode:1 inline:1 " >cubic-bezier(P1x, P1y, P2x, P2y)</pre>

。在W3C的规范中，定义了这四个点的纵横坐标都需要在0和1之间，这也就意味着无论怎么变化，曲线上所有的点都必须在这个1*1的正方形内，对比上面jquery ui easing的曲线图，我们可以确认像elastic这类的效果，使用timing-function就无能为力了。

想多了解一下css3的timing function，不妨到[这个网站](http://cubic-bezier.com/)上自己动手试验一下。

## 编写easing function

说了半天的timing function，终于又回到easing function上来了。自己动手写easing function，那自由度，无边无际。从上面的介绍中，我们往往会有这样一个错觉，progress=0时，eased=0；progress=1时，eased=1。timing function中，因为P0和P3是定死的，所以这条一定成立，但在easing function中，其实并没有这个限制。

什么意思？以我们开篇的动画为例，我们看一个方块从左上角运动一圈的轨迹。先说水平方向上，progress&lt;0.25时，left属性从0px变成220px；0.25&lt;=progress&lt;0.5时，left保持220px；0.5&lt;=progress&lt;0.75时，left属性从220px变成0px；0.75&lt;=progress&lt;1时，left保持0px。再看竖直方向上，progress&lt;0.25时，top保持0px；0.25&lt;=progress&lt;0.5时，top从0px变成220px；0.5&lt;=progress&lt;0.75时，top保持220px；0.75&lt;=progress&lt;1时，top从220px变成0px。那么这个过程反映成easing function就是：

<pre class="lang:js decode:true " title="自定义easing函数" >function horizontal(progress) {
    if (progress &lt; 0.25) {
        return progress * 4;
    }
    else if (progress &lt; 0.5) {
        return 1;
    }
    else if (progress &lt; 0.75) {
        return (0.75 - progress) * 4;
    }
    return 0;
}
function vertical(progress) {
    if (progress &lt; 0.25) {
        return 0;
    }
    else if (progress &lt; 0.5) {
        return (progress - 0.25) * 4;
    }
    else if (progress &lt; 0.75) {
        return 1;
    }
    return (1 - progress) * 4;
}</pre>

接下来扩展jquery的easing效果库：

<pre class="lang:js decode:true " >$.extend($.easing,
        {
            "vertical": vertical,
            "horizontal": horizontal
        });</pre>

在$.animate中就可以像linear或者swing那样使用了：

<pre class="lang:js decode:true " >(function firstMove(){
    $first.animate({
        "left":220,
        "top":220
    },{
        duration: 1600,
        specialEasing: {
            left: 'horizontal',
            top: 'vertical'
        },
        complete: function() {
            firstMove();
        }
    });
})();
(function secondMove(){
    $second.animate({
        "left":0,
        "top":0
    },{
        duration: 1600,
        specialEasing: {
            left: 'horizontal',
            top: 'vertical'
        },
        complete: function() {
            secondMove();
        }
    });
})();</pre>

我们通过specialEasing这个参数为水平方向和竖直方向指定了不同的动画效果。当然了，在这个场景中，自己写缓动函数并没有降低整体的复杂度，毕竟这个缓动函数逻辑太碎，理解起来肯定比四个animate连起来的方式复杂。但我希望能给大家带来一些思路上的启示，为以后可能遇到的问题积累经验。
