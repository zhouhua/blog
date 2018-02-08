---
title: 别说不可能，nodejs中实现sleep
tags:
  - addon
  - CSS
  - Javascript
  - nodejs
id: 264
categories:
  - 技术
layout: post
date: 2015-03-04 15:34:22
---

nodejs最让人不爽的就是其单线程特性，很多事情没法做，对CPU密集型的场景，性能也不够强劲。很长一段时间，我想在javascript语言框架下寻求一些解决方案，解决无法操作线程、性能差的问题。曾经最让我印象深刻的方案是[fibers](http://www.zhouhua.info/2014/03/13/fibers/)，不过fibers也好，其他方案也好，在线程操作上还是很别扭，太过依赖辅助线程，本末倒置；就fiber而言，javascript固有的低性能问题并不能解决；最别扭的是在javascript语言框架下，线程间的消息传递常常很受限制，经常无法真正地共享对象。</p>

nodejs的addon方式无疑是极好的，具有极强的灵活性、完备的功能和原生代码的性能。简单说就是让nodejs直接调用c/c++模块，是一种javascript和native的混合开发模式。好东西呀，为什么不用呢？addon应该算是一个大话题，今天我也不想太深入说这个，我自己的实践也不是很多。那就实现一个sleep函数，就当是抛砖引玉吧。

## sleep

为什么javascript实现不了真正的sleep？sleep方法是通过向操作系统内核注册一个信号，指定时间后发送唤醒信号，而线程本身则挂起。本质上当线程

<pre class="lang:js decode:1 inline:1 " >sleep(1000)</pre>

 代表告诉操作系统：1000ms内不要给我分配CPU时间。所以sleep能保证线程挂起时不再占用CPU资源。而javascript是单线程运行，本身取消了线程的概念，自然没有办法将主线程挂起中断。

也有人会尝试用javascript方法要实现sleep，例如这样：

<pre class="lang:js decode:true" title="javascript实现sleep">function sleep(sleepTime) {
    for(var start = +new Date; +new Date - start &lt;= sleepTime; ) { } 
}</pre>

 这是采用空循环阻塞住主进程的运行来实现sleep，明显跟真正的sleep相去甚远。

那么如果实现一个真正的sleep呢？

## 环境准备

### 开发环境

之前我的一些博客已经说过，这里从略：node.js+npm、python 2.7、visual studio/ x-code。

###  编译工具

编译工具需要采用node-gyp，较新版本的nodejs自带此库，如果没有自带node-gyp，请执行：

<pre class="lang:batch decode:true ">npm install -g node-gyp</pre>

 gyp特性我没有精力去研究，如果你比较熟悉gcc等其他编译器，不排除gyp会有不兼容之处，而且编译选项和开关也是不尽相同。建议针对nodejs重新编写c++代码，如果确实有模块需要复用，可以考虑先用熟悉的gcc编译成动态链接库，再编写少量代码来使用动态链接库，再把这部分代码用gyp编译出来供nodejs使用。

进入项目文件夹，执行

<pre class="lang:batch decode:1 inline:1 " >npm init</pre>

 初始化项目。为了让nodejs知道我们想制作addon，我们需要在package.json中添加：

<pre class="lang:js decode:true ">"gyp-file": true</pre>

 如果使用过gcc，那么你一定记得makefile。类似的，gyp也是通过一个文件来描述编译配置，这个文件为binding.gyp，它是一个我们非常熟悉的json文件。gyp不是我们探讨的重点，所以binding.gyp也不会深入探究，我们只关注最重要的一些配置项。以下是一份简单但完整的binding.gyp文件示例：

<pre class="lang:js decode:true">{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "hello.cc" ],
      "include_dirs": [
        "&lt;!(node -e \"require('nan')\")"
      ]
    }
  ]
}</pre>

 就看看这里面涉及的三个配置项：

*   target_name：表示输出出来的模块名。
*   sources：表示需要编译的源代码路径，这是一个数组。
*   include_dirs：表示编译过程中要用到的目录，这些目录中的头文件可以在预编译指令<pre class="lang:c++ decode:1 inline:1 " >#include</pre> 搜索到。在这里使用了一个比较特殊的写法，没有把路径用字符串常量给出，而是运行一个命令<pre class="lang:batch decode:1 inline:1 " >node -e "require('nan')"</pre> ，nan库后面再说，先看看这个命令输出什么：<pre class="lang:sh decode:1 inline:1 " >node_modules\nan</pre> ，原来这句命令的意思是返回nan库的路径。

## C++编码

 OK，既然已经配置了源代码是hello.cc，那就建立一个这样的文件。有一个问题需要提前提醒大家，我们所写的c++模块最终是要被v8引擎使用，所以api、写法等受到v8引擎的制约。而不同版本的nodejs其实采用的v8引擎的版本也不尽相同，这也就意味着很难用一套c++代码满足不同版本的nodejs（指编译过程，编译完成后跨版本应该能够使用，没有验证过。github不能上传二进制类库，所以github上开源会有麻烦。npm可以直接上传二进制类库，跳过编译步骤，所以问题相对较小）。

### node 0.11及以上版本：

<pre class="lang:js decode:true">#include &lt;node.h&gt;
#include &lt;v8.h&gt;

using namespace v8;

void SleepFunc(const v8::FunctionCallbackInfo&lt;Value&gt;&amp; args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  double arg0 = args[0] -&gt; NumberValue();
  Sleep(arg0);
}

void Init(Handle&lt;Object&gt; exports) {
  Isolate* isolate = Isolate::GetCurrent();
  exports-&gt;Set(String::NewFromUtf8(isolate, "sleep"),
      FunctionTemplate::New(isolate, SleepFunc)-&gt;GetFunction());
}

NODE_MODULE(hello, Init);</pre>

### node 0.10及以下版本：

<pre class="lang:js decode:true">#include &lt;node.h&gt;
#include &lt;v8.h&gt;

using namespace v8;

Handle&lt;Value&gt; SleepFun(const Arguments&amp; args) {
  HandleScope scope;  
  double arg0 = args[0] -&gt; NumberValue();
  Sleep(arg0);
  return scope.Close(Undefined());
}

void Init(Handle&lt;Object&gt; exports) {
  exports-&gt;Set(String::NewSymbol("sleep"),
      FunctionTemplate::New(SleepFun)-&gt;GetFunction());
}

NODE_MODULE(hello, Init);</pre>

 可以看出，变化还是相当大的，如果能屏蔽这些差异就太好了，有办法了？我写这么多还不就是想告诉你有办法。是时候请出nan库了。

### nan

还记得在binding.gyp中，我们引入nan库的路径，就是要在这里用。nan库是干嘛的呢？它提供了一层抽象，屏蔽了nodejs 0.8、nodejs 0.10、nodejs 0.12、io.js之前addon的语法差异。赞！

先安装：

<pre class="lang:batch decode:1 inline:1 " >npm install --save nan</pre>

 ，看看同样的功能，用了nan后如何实现：

<pre class="lang:js decode:true">#include &lt;nan.h&gt;
using namespace v8;

NAN_METHOD(Sleep){
    NanScope();
    double arg0=args[0]-&gt;NumberValue();
    Sleep(arg0);
    NanReturnUndefined();
}

void Init(Handle&lt;Object&gt; exports){
    exports-&gt;Set(NanSymbol("sleep"), FunctionTemplate::New(Sleep)-&gt;GetFunction());
}

NODE_MODULE(hello, Init);</pre>

 你需要了解的就是nan这套东西，至于v8的那一套就可以不用关注。

从下往上看：

<pre class="lang:js decode:true">NODE_MODULE(hello, Init);</pre>

 这句定义addon的入口。注意第一个参数要与我们在binding.gyp中target_name一项一致。第二个参数就是addon的入口函数。

<pre class="lang:js decode:true ">void Init(Handle&lt;Object&gt; exports){
    exports-&gt;Set(NanSymbol("sleep"), FunctionTemplate::New(Sleep)-&gt;GetFunction());
}</pre>

 这段代码就是addon的入口方法。它接收两个参数，分别是exports和module。上面的示例省略了第二个参数。如果模块提供一个对象，可以像示例中那个，直接给exports指定要提供的key-value；如果特殊一点，仅提供一个数值，或一个函数，则需要用到第二个参数，类似于

<pre class="lang:js decode:1 inline:1 " >NODE_SET_METHOD(module, "exports", foo);</pre>

 。这个示例中是表示要输出这样一个模块：

<pre class="lang:js decode:true ">{
    "sleep": Sleep
}</pre>

 Sleep是一个函数，下来就来看看Sleep的定义：

<pre class="lang:js decode:true">NAN_METHOD(Sleep){
    NanScope();
    double arg0=args[0]-&gt;NumberValue();
    Sleep(arg0);
    NanReturnUndefined();
}</pre>

 其实就是读取javascript传入的参数，转成double型，再调用c++的sleep方法。

## 编译addon

下面就要开始编译这个模块了。首先执行

<pre class="lang:batch decode:1 inline:1 " >node-gyp configure</pre>

 来进行构建前准备工作，它会生成一个build文件夹和一些文件。接下来运行

<pre class="lang:batch decode:1 inline:1 " >node-gyp build</pre>

 就可以开始编译了。在这个示例中，最终会在/build/Release/目录下生成一个hello.node文件，这就是最终能被javascript引用的addon模块了。

如果后续对c++代码有修改，就不用再运行

<pre class="lang:batch decode:1 inline:1 " >node-gyp configure</pre>

 ，直接运行

<pre class="lang:batch decode:1 inline:1 " >node-gyp build</pre>

 就好。

## nodejs使用

建立一个index.js，看看怎么用这个模块吧：

<pre class="lang:js decode:true">var sleep=require('./build/Release/hello.node').sleep;

console.log(new Date);
sleep(1000);
console.log(new Date);

// result
// Wed Mar 04 2015 14:55:18 GMT+0800 (中国标准时间) 
// Wed Mar 04 2015 14:55:19 GMT+0800 (中国标准时间)        </pre>

 很容易吧，跟普通的javascript函数的使用方式一模一样。

至此本文想要分享的技术要点已经阐述完了。不过……究竟跟开篇提供的方法比起来有什么不一样？我不截图了，直接说明结果：

<table style="height: 111px;" width="624">
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

由于addon方式采用的方法是线程挂起，理论上不会有CPU占用和内存变化，结果也是验证了这一点。再看javascript循环模拟sleep的方式，因为一直在跑循环，内存增加一点可以理解，没什么大不了；再看CPU占用25%，似乎还算过得去。真的是这样吗？揭露真相的时候到了。我测试的笔记本电脑的CPU是双核四线程，再结合25%的CPU占用……难道双核四线程中有一个线程就被这个sleep给占用了？其实我发现这期间并没有一个线程被锁死，不过这不是javascript的功劳，而是intel超线程的功劳。因为说是四线程，其实本质是两个处理核心只能是双线程，只是cpu做了一个时间片切割上的小把戏。例如核心cpu01分成了t0和t2，假设在n tick（调度周期）后的一个tick内，任务会分到t0，那么在再后面一个tick，任务会分到t2。所以从一个比较长的时间尺度（相对于调度周期），一个任务在t0和t2上运行的时间基本是相当的。于是呈现出来的情景是nodejs的进程没有占用t0或t2到100%，而是分别占用了50%上下。由于windows的进程调度相对比较复杂，所以CPU占用量上下浮动很大。可以这样预测，如果是双核双线程的CPU来处理这个脚本，CPU占用会上升到50%，并且一个核心卡死。如果是单核CPU来处理，CPU一下子会上升到100%。

好像CPU这段说得有点多，超线程那些也是猜测，各位看看就好。
