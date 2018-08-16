fa---
title: 别说不可能，Node.js 中实现 sleep
tags:
  - addon
  - CSS
  - Javascript
  - Node.js
id: 264
category: 技术
layout: post
date: 2015-03-04 15:34:22
---

Node.js 最让人不爽的就是其单线程特性，很多事情没法做，对 CPU 密集型的场景，性能也不够强劲。很长一段时间，我想在 javascript 语言框架下寻求一些解决方案，解决无法操作线程、性能差的问题。曾经最让我印象深刻的方案是 [fibers](http://www.zhouhua.info/2014/03/13/fibers/)，不过 fibers 也好，其他方案也好，在线程操作上还是很别扭，太过依赖辅助线程，本末倒置；就 fiber 而言，javascript 固有的低性能问题并不能解决；最别扭的是在 javascript 语言框架下，线程间的消息传递常常很受限制，经常无法真正地共享对象。

Node.js 的 addon 方式无疑是极好的，具有极强的灵活性、完备的功能和原生代码的性能。简单说就是让 Node.js 直接调用 c/c++ 模块，是一种 javascript 和 native 的混合开发模式。好东西呀，为什么不用呢？addon 应该算是一个大话题，今天我也不想太深入说这个，我自己的实践也不是很多。那就实现一个 sleep 函数，就当是抛砖引玉吧。

## sleep

为什么 javascript 实现不了真正的 sleep？sleep 方法是通过向操作系统内核注册一个信号，指定时间后发送唤醒信号，而线程本身则挂起。本质上当线程 `sleep(1000)` 代表告诉操作系统：1000ms 内不要给我分配 CPU 时间。所以 sleep 能保证线程挂起时不再占用 CPU 资源。而 javascript 是单线程运行，本身取消了线程的概念，自然没有办法将主线程挂起中断。

也有人会尝试用 javascript 方法要实现 sleep，例如这样：

```javascript
function sleep(sleepTime) {
    for(var start = +new Date; +new Date - start <= sleepTime; ) { }
}
```

这是采用空循环阻塞住主进程的运行来实现 sleep，明显跟真正的 sleep 相去甚远。

那么如果实现一个真正的 sleep 呢？

## 环境准备

### 开发环境

之前我的一些博客已经说过，这里从略：Node.js+npm、python 2.7、visual studio/ x-code。

###  编译工具

编译工具需要采用 node-gyp，较新版本的 Node.js 自带此库，如果没有自带 node-gyp，请执行：

```bash
npm install -g node-gyp
```

gyp 特性我没有精力去研究，如果你比较熟悉 gcc 等其他编译器，不排除 gyp 会有不兼容之处，而且编译选项和开关也是不尽相同。建议针对 Node.js 重新编写 c++ 代码，如果确实有模块需要复用，可以考虑先用熟悉的 gcc 编译成动态链接库，再编写少量代码来使用动态链接库，再把这部分代码用 gyp 编译出来供 Node.js 使用。

进入项目文件夹，执行

```bash
npm init
```

初始化项目。为了让 Node.js 知道我们想制作 addon，我们需要在 package.json 中添加：

```json
"gyp-file": true
```

如果使用过 gcc，那么你一定记得 makefile。类似的，gyp 也是通过一个文件来描述编译配置，这个文件为 binding.gyp，它是一个我们非常熟悉的 json 文件。gyp 不是我们探讨的重点，所以 binding.gyp 也不会深入探究，我们只关注最重要的一些配置项。以下是一份简单但完整的 binding.gyp 文件示例：

```json
{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "hello.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
```

就看看这里面涉及的三个配置项：

* `target_name`：表示输出出来的模块名。
* `sources`：表示需要编译的源代码路径，这是一个数组。
* `include_dirs`：表示编译过程中要用到的目录，这些目录中的头文件可以在预编译指令 `#include` 搜索到。在这里使用了一个比较特殊的写法，没有把路径用字符串常量给出，而是运行一个命令 `node -e "require('nan')"` ，nan 库后面再说，先看看这个命令输出什么：`node_modules\nan` ，原来这句命令的意思是返回 nan 库的路径。

## C++ 编码

OK，既然已经配置了源代码是 hello.cc，那就建立一个这样的文件。有一个问题需要提前提醒大家，我们所写的 c++ 模块最终是要被v8引擎使用，所以api、写法等受到v8引擎的制约。而不同版本的 Node.js 其实采用的 v8 引擎的版本也不尽相同，这也就意味着很难用一套 c++ 代码满足不同版本的 Node.js（指编译过程，编译完成后跨版本应该能够使用，没有验证过。github 不能上传二进制类库，所以 github 上开源会有麻烦。npm 可以直接上传二进制类库，跳过编译步骤，所以问题相对较小）。

### node 0.11 及以上版本：

```cpp
#include <node.h>
#include <v8.h>

using namespace v8;

void SleepFunc(const v8::FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);
    double arg0 = args[0] -> NumberValue();
    Sleep(arg0);
}

void Init(Handle<Object> exports) {
    Isolate* isolate = Isolate::GetCurrent();
    exports->Set(String::NewFromUtf8(isolate, "sleep"),
        FunctionTemplate::New(isolate, SleepFunc)->GetFunction());
}

NODE_MODULE(hello, Init);
```

### node 0.10 及以下版本：

```cpp
#include <node.h>
#include <v8.h>

using namespace v8;

Handle<Value> SleepFun(const Arguments& args) {
    HandleScope scope;
    double arg0 = args[0] -> NumberValue();
    Sleep(arg0);
    return scope.Close(Undefined());
}

void Init(Handle<Object> exports) {
    exports->Set(String::NewSymbol("sleep"),
        FunctionTemplate::New(SleepFun)->GetFunction());
}

NODE_MODULE(hello, Init);
```

可以看出，变化还是相当大的，如果能屏蔽这些差异就太好了，有办法了？我写这么多还不就是想告诉你有办法。是时候请出 nan 库了。

### nan

还记得在 binding.gyp 中，我们引入 nan 库的路径，就是要在这里用。nan 库是干嘛的呢？它提供了一层抽象，屏蔽了 Node.js 0.8、Node.js 0.10、Node.js 0.12、io.js 之前 addon 的语法差异。赞！

先安装：`npm install --save nan`，看看同样的功能，用了nan后如何实现：

```cpp
#include <nan.h>
using namespace v8;

NAN_METHOD(Sleep){
    NanScope();
    double arg0=args[0]->NumberValue();
    Sleep(arg0);
    NanReturnUndefined();
}

void Init(Handle<Object> exports){
    exports->Set(NanSymbol("sleep"), FunctionTemplate::New(Sleep)->GetFunction());
}

NODE_MODULE(hello, Init);
```

你需要了解的就是 nan 这套东西，至于 v8 的那一套就可以不用关注。

从下往上看：`NODE_MODULE(hello, Init);` 这句定义 addon 的入口。注意第一个参数要与我们在 binding.gyp 中 target_name 一项一致。第二个参数就是 addon 的入口函数。

```cpp
void Init(Handle<Object> exports){
    exports->Set(NanSymbol("sleep"), FunctionTemplate::New(Sleep)->GetFunction());
}
```

这段代码就是 addon 的入口方法。它接收两个参数，分别是 exports 和 module。上面的示例省略了第二个参数。如果模块提供一个对象，可以像示例中那个，直接给 exports 指定要提供的 key-value；如果特殊一点，仅提供一个数值，或一个函数，则需要用到第二个参数，类似于 `NODE_SET_METHOD(module, "exports", foo);`。这个示例中是表示要输出这样一个模块：

```json
{
    "sleep": Sleep
}
```

Sleep 是一个函数，下来就来看看 Sleep 的定义：

```cpp
NAN_METHOD(Sleep){
    NanScope();
    double arg0=args[0]->NumberValue();
    Sleep(arg0);
    NanReturnUndefined();
}
```

其实就是读取 javascript 传入的参数，转成 double 型，再调用 c++ 的 sleep 方法。

## 编译 addon

下面就要开始编译这个模块了。首先执行 `node-gyp configure` 来进行构建前准备工作，它会生成一个 build 文件夹和一些文件。接下来运行 `node-gyp build` 就可以开始编译了。在这个示例中，最终会在 /build/Release/ 目录下生成一个 hello.node 文件，这就是最终能被 javascript 引用的 addon 模块了。

如果后续对 c++ 代码有修改，就不用再运行 `node-gyp configure` ，直接运行 `node-gyp build` 就好。

## Node.js 使用

建立一个 index.js，看看怎么用这个模块吧：

```javascript
var sleep=require('./build/Release/hello.node').sleep;

console.log(new Date);
sleep(1000);
console.log(new Date);

// result
// Wed Mar 04 2015 14:55:18 GMT+0800 (中国标准时间) 
// Wed Mar 04 2015 14:55:19 GMT+0800 (中国标准时间)
```

很容易吧，跟普通的 javascript 函数的使用方式一模一样。

至此本文想要分享的技术要点已经阐述完了。不过……究竟跟开篇提供的方法比起来有什么不一样？我不截图了，直接说明结果：

<table style="height: 111px;">
<tbody>
<tr>
<td style="text-align: center;"> </td>
<td style="text-align: center;">CPU占用（%）</td>
<td style="text-align: center;">内存占用（MB）</td>
</tr>
<tr>
<td style="text-align: center;">c++ addon</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">6.2</td>
</tr>
<tr>
<td style="text-align: center;">javascript循环模拟</td>
<td style="text-align: center;">25</td>
<td style="text-align: center;">8.4</td>
</tr>
</tbody>
</table>

由于 addon 方式采用的方法是线程挂起，理论上不会有 CPU 占用和内存变化，结果也是验证了这一点。再看 javascript 循环模拟 sleep 的方式，因为一直在跑循环，内存增加一点可以理解，没什么大不了；再看 CPU 占用25%，似乎还算过得去。真的是这样吗？揭露真相的时候到了。我测试的笔记本电脑的 CPU 是双核四线程，再结合25%的 CPU 占用……难道双核四线程中有一个线程就被这个 sleep 给占用了？其实我发现这期间并没有一个线程被锁死，不过这不是 javascript 的功劳，而是 intel 超线程的功劳。因为说是四线程，其实本质是两个处理核心只能是双线程，只是 cpu 做了一个时间片切割上的小把戏。例如核心 cpu01 分成了 t0 和 t2，假设在 n tick（调度周期）后的一个 tick 内，任务会分到 t0，那么在再后面一个 tick，任务会分到 t2。所以从一个比较长的时间尺度（相对于调度周期），一个任务在 t0 和 t2 上运行的时间基本是相当的。于是呈现出来的情景是 Node.js 的进程没有占用 t0 或 t2 到100%，而是分别占用了50%上下。由于 windows 的进程调度相对比较复杂，所以 CPU 占用量上下浮动很大。可以这样预测，如果是双核双线程的 CPU 来处理这个脚本，CPU 占用会上升到50%，并且一个核心卡死。如果是单核 CPU 来处理，CPU 一下子会上升到100%。

好像 CPU 这段说得有点多，超线程那些也是猜测，各位看看就好。
