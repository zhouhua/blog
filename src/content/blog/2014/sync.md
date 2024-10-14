---
title: 在 Node.js 中实现阻塞
tags:
  - fiber
  - Javascript
  - Node.js
  - 同步
  - 并发
  - 异步
category: 技术
hero: ./sync.jpg
type: post
date: 2014-03-18 22:45:57
---

Node.js 中与生俱来的单线程编程、回调函数异步式风格让我们有时喜有时忧。先说单线程，很多人会费解于 Node.js 的单线程如何能做到高并发？这个问题不是本文重点，点到为止。澄清一点，Node.js 的单线程仅仅指 javascript 引擎是单线程的，无论如何我们没有办法在 javascript 中实现多线程和阻塞（本文用到的方法同样不是通过 V8 引擎实现同步的）；但对于 Node.js 的其他方面不代表不能多线程，例如 IO。如果现在 Node.js 遭受大量请求，而这些请求都是 IO 密集型的，那么此时 Node.js 每接受一个请求，在遇到耗时较长的 IO 操作时，javascript 线程并不会一直在此等待，而是交出控制，在回调堆栈里添加 IO 操作完成后要执行的操作（当回调层级过多，访问数量过大，大量的回调链可能会爆栈）。而在这段时间内，Node.js 又可以处理其他请求了。所以对于 Node.js 而言，虽然 javascript 是单线程的，每次只能处理一个请求，但 javascript 处理一个请求的时间往往较短（对于 IO 密集型应用而言），只要可以异步处理，那么在处理的过程中，此次请求都会释放控制，使 Node.js 能处理其他请求。这并发请求的同时，IO 其实一直处于并发状态，减少处理请求的线程数，节约资源以增加 IO 的线程数，对于通常耗时很长的 IO 密集型请求来说，无疑能带来性能上的提升。

前面啰啰嗦嗦地一直在强调 IO 密集型，其实是在强调 Node.js 的强项。相应的，它的短板就是 CPU 密集型的请求。道理很简单，javascript 不会并发，只能一个请求完成后才能处理其他请求。一个请求处理的时间越长，其他请求等待的时间越长。同一时间只会有一个请求被处理，并发性能很低。

话说到这儿，我想申明一点：Node.js 不应该被阻塞；能异步处理的方法异步处理（如使用 `fs.readFile()`，而非 `fs.readFileSync()` 方法）。

Node.js 中不能阻塞，并不代表 Node.js 外不能阻塞。前面我们有讲到 [fibers](/2014/fibers/)，现在，我们就来尝试在 fibers 中实现阻塞。就以处理一个 http 请求为例吧：

```js
const http = require('node:http');
const Fiber = require('fibers');
Fiber(() => {
  const httpFiber = Fiber.current;
  let html = '';
  http.get('http://www.baidu.com', (res) => {
    const dataFiber = Fiber.current;
    res.on('data', (data) => {
      html += data;
    });
    res.on('end', (data) => {
      httpFiber.run();
    });
  });
  Fiber.yield();
  console.log(html);
}).run();
```

> `yield()`、`run()` 这两个方法还不了解的同学，请自行查阅 [《fibers in Node.js》](/2014/fibers/)。

fibers 的运行并不在 Node.js 进程中，所以在 fibers 内部实现阻塞对 Node.js 整体的性能并没有影响。而且实现起来也是相当容易，只需要在想阻塞的时候，把 fiber yield 掉。需要继续运行，则执行 `run()` 恢复 fiber。在上面的例子中，我们希望当 http.get 请求发起时阻塞当前程序，当所有数据接收完成时，恢复程序。于是我们在调用 http.get 后使用 `Fiber.yield()` 中断此 fiber。在对 response 的监听中，如果触发 `end` 事件表明数据传输完成，于是在 `end` 的回调函数中，调用 `Fiber.current.run()` 恢复 fiber，这样，后续的代码就以同步的方式拿到 http.get 请求的数据。

上面的示例只是提供一种思路。如果对这种思路进行一些抽象封装，比如说，对有接受回调函数为参数的异步方法进行一步柯里化，在调用后中断，并劫持回调函数，以恢复程序的代码为回调函数。获取异步数据后，再程序触发预定的回调函数，这样基本能实现异步方法同步化。这段说得比较乱，基本上就是 `fibers/future` 的实现思路，如果有兴趣，请参考其 [源代码](https://github.com/laverdet/Node.js-fibers/blob/master/future.js)。
