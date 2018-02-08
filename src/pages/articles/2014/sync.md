---
title: 在Node.js中实现阻塞
tags:
  - fiber
  - Javascript
  - Node.js
  - 同步
  - 并发
  - 异步
categories:
  - 技术
  - javascript
layout: post
date: 2014-03-18 22:45:57
---

Node.js中与生俱来的单线程编程、回调函数异步式风格让我们有时喜有时忧。先说单线程，很多人会费解于Node.js的单线程如何能做到高并发？这个问题不是本文重点，点到为止。澄清一点，Node.js的单线程仅仅指javascript引擎是单线程的，无论如何我们没有办法在javascript中实现多线程和阻塞（本文用到的方法同样不是通过V8引擎实现同步的）；但对于Node.js的其他方面不代表不能多线程，例如IO。如果现在Node.js遭受大量请求，而这些请求都是IO密集型的，那么此时Node.js每接受一个请求，在遇到耗时较长的IO操作时，javascript线程并不会一直在此等待，而是交出控制，在回调堆栈里添加IO操作完成后要执行的操作（当回调层级过多，访问数量过大，大量的回调链可能会爆栈）。而在这段时间内，Node.js又可以处理其他请求了。所以对于Node.js而言，虽然javascript是单线程的，每次只能处理一个请求，但javascript处理一个请求的时间往往较短（对于IO密集型应用而言），只要可以异步处理，那么在处理的过程中，此次请求都会释放控制，使Node.js能处理其他请求。这并发请求的同时，IO其实一直处于并发状态，减少处理请求的线程数，节约资源以增加IO的线程数，对于通常耗时很长的IO密集型请求来说，无疑能带来性能上的提升。

前面啰啰嗦嗦地一直在强调IO密集型，其实是在强调Node.js的强项。相应的，它的短板就是CPU密集型的请求。道理很简单，javascript不会并发，只能一个请求完成后才能处理其他请求。一个请求处理的时间越长，其他请求等待的时间越长。同一时间只会有一个请求被处理，并发性能很低。

话说到这儿，我想申明一点：Node.js不应该被阻塞；能异步处理的方法异步处理（如使用fs.readFile()，而非fs.readFileSync()方法）。

Node.js中不能阻塞，并不代表Node.js外不能阻塞。前面我们有讲到[fibers](/2014/03/13/fibers/)，现在，我们就来尝试在fibers中实现阻塞。就以处理一个http请求为例吧：

```js
var Fiber = require('fibers');
var http = require("http");
Fiber(function () {
    var httpFiber = Fiber.current;
    var html = "";
    http.get("http://www.baidu.com", function (res) {
        var dataFiber = Fiber.current;
        res.on("data", function (data) {
            html += data;
        });
        res.on("end", function (data) {
            httpFiber.run();
        });
    });
    Fiber.yield();
    console.log(html);
}).run();
```

> `yield()`、`run()`这两个方法还不了解的同学，请自行查阅[《fibers in Node.js》](/2014/03/13/fibers/)。

fibers的运行并不在Node.js进程中，所以在fibers内部实现阻塞对Node.js整体的性能并没有影响。而且实现起来也是相当容易，只需要在想阻塞的时候，把fiber yield掉。需要继续运行，则执行`run()`恢复fiber。在上面的例子中，我们希望当http.get请求发起时阻塞当前程序，当所有数据接收完成时，恢复程序。于是我们在调用http.get后使用`Fiber.yield()`中断此fiber。在对response的监听中，如果触发`end`事件表明数据传输完成，于是在`end`的回调函数中，调用`Fiber.current.run()`恢复fiber，这样，后续的代码就以同步的方式拿到http.get请求的数据。

上面的示例只是提供一种思路。如果对这种思路进行一些抽象封装，比如说，对有接受回调函数为参数的异步方法进行一步柯里化，在调用后中断，并劫持回调函数，以恢复程序的代码为回调函数。获取异步数据后，再程序触发预定的回调函数，这样基本能实现异步方法同步化。这段说得比较乱，基本上就是`fibers/future`的实现思路，如果有兴趣，请参考其[源代码](https://github.com/laverdet/Node.js-fibers/blob/master/future.js)。
