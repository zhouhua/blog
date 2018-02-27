---
title: 在 Node.js 中使用多线程编程
tags:
  - addon
  - c/c++
  - Javascript
  - Node.js
  - 多线程
  - 性能
id: 297
category: 技术
layout: post
date: 2015-03-16 15:29:53
---

在以前的博文[别说不可能，Node.js 中实现 sleep](/2015/sleep) 中，我向大家介绍了 Node.js addon 的用法。今天的主题还是 addon，继续挖掘 c/c++ 的能力，弥补Node.js的弱点。

我曾多次提到过 Node.js 的性能问题。其实就语言本身而言，Node.js 的性能还是很高的，虽然不及大多部静态语言，但差距也并不大；相对其他动态语言而言，速度优势非常明显。但为什么我们常常说 Node.js 不能胜任 CPU 密集型场景呢？因为由于其单线程特性，对于 CPU 密集型场景，它并不能充分利用 CPU。计算机科学中有一个著名的 **Amdahl 定律**：

$$
speedup = \dfrac{W_s+W_p}{W_s+\frac{W_p}{p}}
$$

假设总工作量 $W$，可以分解为两个部分：只能串行计算的 $W_s$ 和允许并行计算的 $W_p$。那么，在 $p$ 个 CPU 并行计算的情况下，性能上能够带来 $speedup$ 倍的提升。Amdahl 定律描述了并行能做到的和不能做到的。它是一种理想情况，实际情况会复杂得多。比如并发很可能会引起资源的争夺，需要增加各种锁，从而常常让并行处于等待状态；并发还会额外带来操作系统对线程调度切换的时间开销，增加 $W_s$。不过，当一项任务中，$W_p$ 比 $W_s$ 大得多，并且有多个 CPU 核心可供使用时，并行带来的性能提升是相当可观的。

好，回到 Node.js 上。我们设想一个计算场景：计算4000000内的质数数目。这个场景编程实现的时候，以除法运算为主，不涉及内存、对象等操作，理论上能够确保让 Node.js 以相对较快的速度运行，不会落后 c 太多，便于对比。

javascript寻找质数的方法如下：

```javascript
function zhishu_js(num) {
    if (num === 1) {
        return false;
    }
    if (num === 2) {
        return true;
    }
    for (var i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return true;
}
```

再写一个c语言版本的：

```cpp
#include <math.h>

bool zhishu(int num){
    if (num == 1) {
        return false;
    }
    if (num == 2) {
        return true;
    }
    for (int i = 2; i <= sqrt(num); i++) {
        if (num % i == 0) {
            return false;
        }
    }
    return true;
};
```

在 Node.js 中，我们用一个从1到4000000的循环来检索质数；c 语言中，我们设置若干个线程，定义 count 为4000000，每个线程做如下操作要：如果 count 大于0，则取出 count 的值，并计算是否为质数，同时将 count 减1。根据这个思路，javascript 版本的很容易写：

```javascript
var count = 0;

for (j = 1; j < 4000000; j++) {
    if(zhishu(j)){
        count++;
    }
}
```

关键难点就是 c 语言的多线程编程。早期 c/c++ 并没有考虑并行计算的需求，所以标准库中并没有提供多线程支持。而不同的操作系统通常实现也是有区别的。为了避免这种麻烦，我们采用 pthread 来处理线程。

[下载 pthread 最新版本](https://www.sourceware.org/pthreads-win32/)。由于我对 gyp 不熟，link 依赖 lib 搞了半天没搞定，最后我的方式是，直接把 pthread 的源代码放到了项目目录下，并在 binding.gyp 中把 pthread.c 添加到源代码列表中，在编译项目的时候把 pthread 也编译一次。修改后的 binding.gyp 是这样的：

```json
{
    "targets": [
        {
        "target_name": "hello",
        "sources": [ "hello.cc","pthreads/pthread.c" ],
        "include_dirs": [
            "<!(node -e \"require('nan')\")",
            "pthreads"
        ],
        "libraries": ["Ws2_32.lib"]
        }
    ]
}
```

当然了，我这种方法很麻烦，如果你们只添加 pthread 中 lib 和 include 目录的引用，并且不出现依赖问题，那是最好的，就没有必要用我的方法来做。

那么接下来就进入 C/C++ 多线程的一切了，定义一个线程处理函数：

```cpp
pthread_mutex_t lock;

void *thread_p(void *null){
    int num, x=0;
    do{
        pthread_mutex_lock(&lock);
        num=count--;
        pthread_mutex_unlock(&lock);
        if(num>0){
            if(zhishu(num))x++;
        }else{
            break;
        }
    }while(true);
    std::cout<<' '<<x<<' ';
    pthread_exit(NULL);
        return null;
}
```

在线程与线程之间，对于 `count` 这个变量是相互竞争的，我们需要确保同时只能有一个线程操作 `count` 变量。我们通过 `pthread_mutex_t lock;` 添加一个互斥锁。当执行 `pthread_mutex_lock(&lock);` 时，线程检查 lock 锁的情况，如果已锁定，则等待、重复检查，阻塞后续代码运行；如果锁已释放，则锁定，并执行后续代码。相应的，`pthread_mutex_unlock(&lock);` 就是解除锁状态。

由于编译器在编译的同时，进行编译优化，如果一个语句没有明确做什么事情，对其他语句的执行也没有影响时，会被编译器优化掉。在上面的代码中，我加入了统计质数数量的代码，如果不加的话，像这样的代码：

```cpp
for (int j = 0; j < 4000000; j++) {
    zhishu(j);
}
```

是会直接被编译器跳过的，实际不会运行。

添加 addon 的写法已经介绍过了，我们实现从 javascript 接收一个参数，表示线程数，然后在 c 中创建指定数量的线程完成质数检索。完整代码：

```cpp
#include <nan.h>
#include <math.h>
#include <iostream>
#include "pthreads\pthread.h"
#define MAX_THREAD 100
using namespace v8;

int count = 4000000;
pthread_t tid[MAX_THREAD];
pthread_mutex_t lock;

void *thread_p(void *null) {
    int num, x = 0;
    do {
        pthread_mutex_lock(&lock);
        num = count--;
        pthread_mutex_unlock(&lock);
        if (num > 0) {
            if (zhishu(num)) x++;
        }
        else {
            break;
        }
    } while (true);
    std::cout<<' '<<x<<' ';
    pthread_exit(NULL);
    return null;
}

NAN_METHOD(Zhishu) {
    NanScope();
    pthread_mutex_init(&lock, NULL);
    double arg0 = args[0]->NumberValue();
    int c = 0;
    for (int j = 0; j < arg0 && j<MAX_THREAD; j++) {
        pthread_create(&tid[j], NULL, thread_p, NULL);
    }
    for (int j = 0; j < arg0 && j<MAX_THREAD; j++) {
        pthread_join(tid[j], NULL);
    }
    NanReturnUndefined();
}

void Init(Handle<Object> exports) {
    exports->Set(NanSymbol("zhishu"), FunctionTemplate::New(Zhishu)->GetFunction());
}

NODE_MODULE(hello, Init);
```

函数 `phread_create` 可以创建线程，默认是 joinable 的，这个时候子线程受制于主线程；`phread_join` 阻塞住主线程，等待子线程 join，直到子线程退出。如果子线程已退出，则 `phread_join` 不会做任何事。所以对所有的线程都执行 `thread_join`，可以保证所有的线程退出后才会例主线程继续进行。

完善一下 Node.js 脚本：

```javascript
var zhishu_c=require('./build/Release/hello.node').zhishu;
function zhishu(num) {
    if (num === 1) {
        return false;
    }
    if (num === 2) {
        return true;
    }
    for (var i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return true;
}

console.time("c");
    zhishu_c(100);
console.timeEnd("c");

console.time("js");
var count=0;
for (j = 1; j < 4000000; j++) {
    if(zhishu(j)){
        count++;
    }
}
console.log(count);
console.timeEnd("js");
```

看一下测试结果：

<table>
<tbody>
<tr>
<td>线程数</td>
<td>1</td>
<td>2</td>
<td>3</td>
<td>4</td>
<td>8</td>
<td>50</td>
<td>100</td>
</tr>
<tr>
<td>C/C++(ms)</td>
<td>1935</td>
<td>1242</td>
<td>1041</td>
<td>940</td>
<td>1021</td>
<td>1016</td>
<td>1038</td>
</tr>
<tr>
<td>Node.js(ms)</td>
<td>3494</td>
<td>3132</td>
<td>3136</td>
<td>3232</td>
<td>3203</td>
<td>3469</td>
<td>3360</td>
</tr>
<tr>
<td>提速度率</td>
<td>181%</td>
<td>252%</td>
<td>302%</td>
<td>344%</td>
<td>314%</td>
<td>341%</td>
<td>324%</td>
</tr>
</tbody>
</table>

 单线程时，虽然 C/C++ 的运行速度是 Node.js 的181%，但这个成绩我们认为在动态语言中，还是非常不错的。双线程时速度提升最明显，那是因为我的电脑是双核四线程 CPU，这个时候已经可能在使用两个核心在进行处理。4线程时速度达到最大，此时应该是双核四线程能达到的极限，当线程再增加时，并不能再提升速度了。上述 Amdahl 定律中，$p$ 已达上限4。再增加线程，会增加操作系统进程调度的时间，增加锁的时间，尽管同时也能增加对CPU时间的竞争，但总体而言，$W_s$ 的增加更加明显，性能是下降的。如果在一台空闲的机器上做这个实验，数据应该会更好一点。

从这个实验中，我们可以得出这样的结论，对于 CPU 密集型的运算，交给静态语言去做，效率会提高很多，如果计算中较多涉及内存、字符串、数组、递归等操作（以后再验证），性能提升更为惊人。同时，合理地利用多线程能有效地提高处理效率，但并不是线程越多越好，要根据机器的情况合理配置。

对于 Node.js 本身，的确是不擅长处理 CPU 密集的任务，但有了本文的经验，我想，想克服这个障碍，并非什么不可能的事情。
