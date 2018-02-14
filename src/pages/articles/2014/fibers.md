---
title: fibers in Node.js
tags:
  - fiber
  - Javascript
  - Node.js
  - 多线程
  - 纤程
id: 46
categories:
  - 技术
  - javascript
layout: post
date: 2014-03-13 22:38:40
---

## fiber/纤程

在操作系统中，除了进程和线程外，还有一种较少应用的**纤程**（fiber，也叫协程）。纤程常常拿来跟线程做对比，对于操作系统而言，它们都是较轻量级的运行态。通常认为纤程比线程更为轻量，开销更小。不同之处在于，纤程是由线程或纤程创建的，纤程调度完全由用户代码控制，对系统内核而言，是一种非抢占性的调度方式，纤程实现了合作式的多任务；而线程和进程则受内核调度，依照优先级，实现了抢占式的多任务。另外，系统内核是不知道纤程的具体运行状态，纤程的使用其实是比较与操作系统无关。

在 Node.js 中，单线程是仅针对 javascript 而言的，其底层其实充斥着多线程。而如果需要在 javascript 中实现多线程，一种常见的做法是编写 C++ addon，绕过 javascript 的单线程机制。不过这种方法提升了开发调试的难度和成本。像其他很多脚本语言，我们也可以把纤程的概念引入到 Node.js 中。

## node-fibers

`node-fibers` 这个库就为 Node.js 提供了纤程的功能。多线程方面没有测试出理想的结果，不过在异步转同步作用显著，也许在减少 Node.js 调用堆栈、无限递归方面也会有价值可挖。本文档主要介绍 `node-fibers` 库的使用方法和异步转同步等内容。

### 安装

`node-fibers` 是采用 C 语言编写，直接下载源码需要编译，通常直接 npm 安装即可：

`npm install fibers`

### fibers库的使用

#### API

* `Fiber(fn)`/`new Fiber(fn)`:

    创建一个纤程，可以当成构造函数使用，也可以当成普通函数调用。如下例：

    ```js
    function fibo(n) {
        return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
    }
    Fiber(function () {
        console.log(fibo(40));
    });
    ```

    当 `run()` 调用的时候，纤程启动，并为 `fn` 分配新的堆栈，`fn` 会在这个新的堆栈上运行，直到`fn`有返回值或调用 `yield()`。`fn` 返回后或调用 `yield()` 后，堆栈重置，当再次调用 `run()` 时，纤程会再次启动，`fn` 运行于首次分配的堆栈中。

* `Fiber.current`:

    获得当前纤程，并可对其进行操作。如果指定一个变量与其相关联，请务必确保此纤程能够释放，否则 V8 的垃圾回收机制会一直忽略这部分的内存，造成内存泄漏。

* `Fiber.yield(param)`:

    前面的说明中已经提及过这个函数。`yield()` 方法用于中断纤程，一定程度上类似 `return`。一旦执行 `yield()`，则此 `Fiber` 中后续代码将没有机会执行，例如：

    ```js
    var fiber = Fiber(function () {
        console.log("Fiber Start");
        Fiber.yield();
        console.log("Fiber Stop");
    }).run();
    // 输出: "Fiber Start"
    ```

    执行后只会输出 “Fiber Start”，后一个输出命令没有执行。如果向 `yield()` 传入参数，那么此参数作为 `run()` 的返回值。

    ```js
    var fiber = Fiber(function () {
        Fiber.yield("success");
    }).run();
    console.log(fiber); // -> "success"
    ```

* `Fiber.prototype.run(param)`:

    这个方法已经很熟悉了，之前隐约有提及调用 `run()` 的两种时态，一是 Fiber 未启动时，一时 Fiber 被 yield 时。在这两种时态下，`run()` 的行为并不太一样。
    当 Fiber 未启动时，`run()` 接受一个参数，并把它传递给 `fn`，作为其参数。当 Fiber 处理 yielding 状态时，`run()` 接受一个参数，并把它作为 `yield()` 的返回值，fn 并不会从头运行，而是从中断处继续运行。关于 `fn`、`yield`、`run` 三者的参数、返回值等关系，可以通过下面的小例子来说明：

    ```js
    var Fiber = require('fibers');
    var fiber = Fiber(function (a) {
        console.log("第一次调用run:");
        console.log("fn参数为："+a);
        var b = Fiber.yield("yield");
        console.log("第二次调用run:");
        console.log("fn参数为："+a);
        console.log("yield返回值为："+b);
        return "return";
    });
    // 第一次运行run()
    var c = fiber.run("One");
    // 第二次运行run()
    var d = fiber.run("Two");
    console.log("调用yield，run返回："+c);
    console.log("fn运行完成，run返回："+d);
    ```

    输出如下：

    ```text
    /*
    第一次调用run:
    fn参数为：One
    第二次调用run:
    fn参数为：One
    yield返回值为：Two
    调用yield，run返回：yield
    fn运行完成，run返回：return
    */
    ```

    从上面例子中，可以很明显看出 `yield` 的使用方法与现在的 javascript 的语法相当不同。在别的语言中（C#、Python 等）已经实现了 `yield` 关键字，作为迭代器的中断。不妨在 Node.js 上也实现一个迭代器，具体体会一下 `yield` 的使用。还是以开头的斐波那契数列为例：

    ```js
    var fiboGenerator = function () {
        var a = 0, b = 0;
        while (true) {
            if (a == 0) {
                a = 1;
                Fiber.yield(a);
            } else {
                b += a;
                b == a ? a = 1 : a = b - a;
                Fiber.yield(b);
            }
        }
    }
    var f = new Fiber(fiboGenerator);
    f.next = f.run;
    for (var i = 0; i <= 10; i++) {
        console.log(f.next());
    }
    ```

    输出为：

    ```text
    /*
    1
    1
    2
    3
    5
    8
    13
    21
    34
    55
    */
    ```

    有两个问题需要留意，第一，`yield` 说是方法，更多地像关键字，与 `run` 不同，`yield` 不需要依托 Fiber 实例，而 `run` 则需要。如果在 Fiber 内部调用 `run`，则一定要使用：`Fiber.current.run()`；第二，`yield` 本身为 javascript 的保留关键字，不确定是否会、何时会启用，所以代码在将来可能会面临变更。

* `Fiber.prototype.reset()`:

    我们已经知道 Fiber 可能存在不同的时态，同时会影响 `run` 的行为。而 `reset` 方法则不管 Fiber 处理什么状态，都恢复到初始状态。随后再执行 `run`，就会重新运行 `fn`。

* `Fiber.prototype.throwInto(Exception)`:

    本质上 `throwInto` 会抛出传给它的异常，并将异常信息作为 `run` 的返回值。如果在 Fiber 内不对它抛出的异常作处理，异常会继续冒泡。不管异常是否处理，它会强制 `yield`，中断 Fiber。

### future库的使用

在 Node.js 中直接使用 Fiber 并不一直是合理的，因为 Fiber 的 API 实在简单，实际使用中难免会产生重复冗长的代码，不利于维护。推荐在 Node.js 与 Fiber 之间增加一层抽象，让 Fiber 能够更好地工作。`future` 库就提供了这样一种抽象。`future` 库或者任何一层抽象也许都不是完美的，没有谁对谁错，只有适用不适用。比如，`future` 库向我们提供了简单的 API 能够完成异步转同步的工作，然而它对封装 generator （类似上面的斐波那契数列生成器）则无能为力。

`future` 库不需要单独下载安装，已经包含在 `fibers` 库中，使用时只需要 `var future = require('fibers/future')` 即可。

#### API

* `Function.prototype.future()`:

    给 `Function` 类型添加了 `future` 方法，将 function 转化成一个 “funture-function”。

    ```js
    var futureFun = function power(a) {
        return a * a;
    }.future();
    console.log(futureFun(10).wait());
    ```

    实际上 `power` 方法是在 Fibel 内执行的。不过现有版本的 `future` 有bug，官方没有具体的说明，如果需要使用此功能，请删除掉 `future.js` 的第339行和第350行。

* `new Future()`

    `Future` 对象的构造函数，下文详细介绍。

* `Future.wrap(fn, idx)`

    `wrap` 方法封装了异步转同步的操作，是 `future` 库中对我们最有价值的方法。`fn` 表示需要转换的函数，`idx` 表示 `fn` 接受的参数数目，认为其 `callback` 方法为最后一个参数（这边 API 的制定颇有争议，有人倾向传递 `callback` 应该处于的位置，好在 `wrap` 方法比较简单，可以比较容易修改代码）。看一个例子就能了解 `wrap` 的用法：

    ```js
    var readFileSync = Future.wrap(require("fs").readFile);
    Fiber(function () {
        var html = readFileSync("./1.txt").wait().toString();
        console.log(html);
    }).run();
    ```

    从这个例子中可以看出Fiber异步转同步确实非常有效，除了语法上多了一步`.wait()`外，其他已经`fs`提供的`fs.readFileSync`方法别无二致了。

* `Future.wait(futures)`:

    这个方法前面已经多次看到了。顾名思义，它的作用就是等待结果。如果要等待一个 future 的实例的结果，直接调用 `futureInstance.wait()` 即可；如果需要等待一系列 future 实例的结果，则调用 `Future.wait(futuresArray)`。需要注意的是，在第二种用法中，一个 future 实例在运行时出现错误，`wait` 方法不会抛出错误，不过我们可以使用 `get()` 方法直接获取运行结果。

* `Future.prototype.get()`:

    `get()` 的用法与 `wait()` 的第一种方式很像，所不同的是，`get()` 立刻返回结果。如果数据没有准备好，`get()` 会抛出错误。

* `Future.prototype.resolve(param1,param2)`:

    上面的的 `wrap` 方法总给人以一种 `future` 其实在吞噬异步方法的回调函数，并直接返回异步结果。事实上 `future` 也通过 `resolve` 方法提供设置回调函数的解决方案。`resolve` 最多接受两个参数，如果只传入一个参数，`future` 认为传了一个 Node.js 风格的回调函数，例如如下示例：

    ```js
    futureInstance.resolve(function (err, data) {
        if (err) {
            throw  err;
        } else {
            console.log(data.toString());
        }
    });
    ```

    如果传入两个参数，则表示对错误和数据分别做处理，示例如下：

    ```js
    futureInstance.resolve(function (err) {
        throw err;
    }, function (data) {
        console.log(data.toString());
    });
    ```

    另外 `future` 并不区分 `resolve` 的调用时机，如果数据没有准备好，则将回调函数压入队列，由 `resolver()` 方法统一调度，否则直接取数据立即执行回调函数。

* `Future.prototype.isResolved()`:

    返回布尔值，表示操作是否已经执行。

* `Future.prototype.proxy(futureInstance)`:

    `proxy` 方法提供一种 `future` 实例的代理，本质上是对 `resolve` 方法的包装，其实是将一个 instance 的回调方法作为另一个 instance 的回调执行者。例如：

    ```js
    var target = new Future;
    target.resolve(function (err, data) {
        console.log(data)
    });
    var proxyFun = function (num, cb) {
        cb(null, num * num);
    };
    Fiber(function () {
        var proxy = Future.wrap(proxyFun)(10);
        proxy.proxy(target);
    }).run(); // 输出100
    ```

    虽然执行的是 `proxy`，但是最终 `target` 的回调函数执行了，并且是以 `proxy` 的执行结果驱动 `target` 的回调函数。这种代理手段也许在我们的实际应用中有很大作用，我暂时还没有深入地思考过。

* `Future.prototype.return(value)`:
* `Future.prototype.throw(error)`:
* `Future.prototype.resolver()`:
* `Future.prototype.detach()`:

    以上四个 API 呢我感觉相对于别的 API，实际使用的场景或作用比较一般。`return` 和 `throw` 都受 `resolver` 方法调度，这三个方法都很重要，在正常的 future 使用流程中都会默默工作着，只是我没有想出具体单独使用它们的场景，所以没有办法具体介绍。`detach` 方法只能算 `resolve` 方法的简化版，亦没有介绍的必要。

> updated 2017/02/13
> es6 的 generator function 特性已能完全实现 fiber 的所有功能。辅助 es7 的 async/await 语法，我们可以很轻松地处理异步问题。
