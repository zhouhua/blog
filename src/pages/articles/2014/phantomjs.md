---
title: phantomjs 使用说明
tags:
  - Node.js
  - phantom
  - phantomjs
  - 多线程
  - 无头测试
category: 技术
hero: ./phantomjs.jpg
layout: post
date: 2014-03-19 22:47:40
---

phantomjs 实现了一个无界面的 webkit 浏览器。虽然没有界面，但 dom 渲染、js 运行、网络访问、canvas/svg 绘制等功能都很完备，在页面抓取、页面输出、自动化测试等方面有广泛的应用。

## 安装

下载phantomjs（[官方下载](https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-windows.zip)。解压到任意目录，并将包含phantomjs.exe的目录添加到系统路径。

如果要借助 phantomjs 进行无头测试，请参考各个测试框架的说明，或者参考 phantomjs 的官方文档：[http://phantomjs.org/headless-testing.html](http://phantomjs.org/headless-testing.html)。

## 使用说明

### 简单示例

```javascript
var page = require('webpage').create(),
  system = require('system'),
  address;
if (system.args.length === 1) {
  phantom.exit(1);
} else {
  address = system.args[1];
  page.open(address, function (status) {
    console.log(page.content);
    phantom.exit();
  });
}
```

运行：

```bash
phantomjs ./test.js http://baidu.com
```

这个例子简单地展示了通过 phantom 访问 baidu.com，并输入 html 内容。使用方式就像使用 Node.js 运行 js 代码一样。在 phantom 运行时，它会向当前代码运行环境注入 phantom 对象。如上面代码中，通过 phantom 对象控制程序终结。示例中其他代码的含义以及更多深入的用法，将在下文中展开。

---

### window对象

在使用 phantom 时，我首先关注的是 DOM 和 BOM 接口。不过这不是一个问题，看了下面的代码就能了解：

```js
console.log(window === this);
phantom.exit();
```

运行：

```bash
phantomjs ./test.js
```

结果为 `true`。也就是说，就像浏览器环境一样，我们的代码运行在 window 环境下，可以很方便地进行 DOM 方面的操作。

> 注：如果使用 web page 模块打开页面，则请不要在此 window 对象下进行任何DOM相关的操作，因为这个 window 并不是 page 对象内的 window。如果想要执行 dom 相关操作，请参阅 `javascript±page.evaluate()` 部分。

---

### phantom对象

之前的例子中我们已经初步认识了 phantom 对象。它的功能是定义和控制 phantom 运行环境的参数和流程。关键的 API 有：

1. `javascript±phantom.args` String[]
   获取传给本 JS 程序的参数，需要与 `javascript±system.args` 进行区分（system 模块详见下文），后者表示传给 phantomjs 引擎的参数。例如 `bash±phantomjs ./test.js http://baidu.com` 这句语句，通过 `javascript±phantom.args`，我们能得到的参数列表为 `javascript±['http://baidu.com']`，而通过 `javascript±system.args` 则得到 `javascript±['./test.js', 'http://baidu.com']` 这样的参数列表。差异就在于是否包含当前脚本名称。不过 `javascript±phantom.scriptName` 这个 API 提供了获取脚本名称的功能。

2. `javascript±phantom.cookies` Object[]
   获取或设置 cookies，不过对于设置建议使用其他的 API 完成。同时相关的 API 还有:

   - `javascript±phantom.addCookie(Object)` Boolean：添加 cookie 值
   - `javascript±phantom.deleteCookie(cookieName)` Boolean：删除指定 Cookie 值
   - `javascript±phantom.clearCookies()`：清空所有的 cookie
   - `javascript±phantom.cookiesEnabled` Boolean：获取或设置是否支持 cookie

3. `javascript±phantom.injectJs(fileName)` Boolean:
   把指定的外部 JS 文件注入到当前环境。执行这个方法时，phantomjs 首先会从当前目录检索此文件，如果找不到，则再到 `javascript±phantom.libraryPath` 指定的路径寻找。`javascript±phantom.libraryPath` 这个 API 基本上就是为 `javascript±phantom.injectJs()` 服务的。

4. `javascript±phantom.onError`
   当页面存在 js 错误，且没有被 `javascript±page.onError` 处理，则会被此 handler 捕获。下面是使用此 API 的一个例子。由于 phantom 环境下代码调试很困难，了解这些错误捕获的 API 也许会对我们的实际使用有所帮助。

   ```js
   phantom.onError = function (msg, trace) {
     var msgStack = ['PHANTOM ERROR: ' + msg];
     if (trace && trace.length) {
       msgStack.push('TRACE:');
       trace.forEach(function (t) {
         msgStack.push(
           ' -> ' +
             (t.file || t.sourceURL) +
             ': ' +
             t.line +
             (t.function ? ' (in function ' + t.function + ')' : '')
         );
       });
     }
     console.error(msgStack.join('\n'));
     phantom.exit(1);
   };
   ```

5. `javascript±phantom.exit(returnValue)`
   这个 API 已经见过多次了，它的作用是退出程序，可以设置一个退出代码，默认是0。

---

### web page 模块

web page 模块的功能是处理具体的页面。使用时需要引入模块，并创建实例：

```js
var webPage = require('webpage');
var page = webPage.create();
```

> 本文中不经说明，`page` 指代 `javascript±require("webpage").create()`的实例。

1. `javascript±page.cookies` Object[]
   与上文中的 `javascript±phantom.cookies` 类似，表示本 url 下的 cookie 的读取。同样类似的 API 还有 `javascript±addCookie()`、`javascript±deleteCookie()`、`javascript±clearCookies()`。

2. 页面内容相关的 API

   - `javascript±page.content` String：获取或设置当前页面的 html。
   - `javascript±page.plainText` String：这是一个只读属性，获取页面去除html标记的文本（考虑 `javascript±$.text()`）。
   - `javascript±page.url` String：只读，获取当前页面的 url。
   - `javascript±page.setContent()`：允许修改 `javascript±page.content` 和 `javascript±page.url` 内容，会触发 reload。

3. `javascript±page.settings` Object
   对于当前页面的一些配置项。此API必须在 `javascript±page.open()` 调用之前设置，否则不会起作用。以下是配置项：

   - `javascriptEnabled` 默认 `true`：是否执行页面内的 javascript
   - `loadImages` 默认 `true`：是否载入图片
   - `userAgent` ：传递给服务器的 userAgent 字符串
   - `userName` ：用于 http 访问授权的用户名
   - `password` ：用于 http 访问授权的密码
   - `XSSAuditingEnabled` 默认 `false`：是否监控跨域请求
   - `resourceTimeout` 单位 `ms`：定义资源请求的超时时间。如果设置了此项，则页面中如果有任何资源超过此时限未请求成功，则页面其他部分也会停止请求，并触发 `javascript±onResourceTimeout()` 事件处理。

4. `javascript±page.customHeaders` Object
   phantom 允许在请求时在 http 请求头部添加额外信息，此设置项对这个 page 里面所有的请求都生效（包含页面和其他资源的请求）。添加的信息并没有限制，但如果设置 `User-Agent` 的值，那么这个值会覆盖掉 `javascript±page.settings` 里的设置值。示例：

   ```js
   page.customHeaders = {
     'X-Test': 'foo',
     'DNT': '1'
   };
   ```

5. `javascript±page.libraryPath` String
   与 `javascript±phantom.libraryPath` 类似，page 对象也支持设置 js 文件路径，同时可以通过相应的 `javascript±page.injectJs()` 方法注入 javascript 文件。除了 `javascript±page.injectJs()` 方法外，还有 `javascript±page.includeJs()` 也可以加入 javascript 文件。它们的区别在于，`javascript±page.injectJs()` 不强求此文件能访问得到，即使是一个不可访问的资源也可以。

6. `javascript±page.navigationLocked` Boolean 默认 `fasle`
   设置是否允许离开当前页面，默认是允许。

7. `javascript±page.open()`
   此方法用于打开一个网页，是一个很重要的 API，它有三种调用形式：

   - `javascript±open(url, callback)`
   - `javascript±open(url, method, callback)`
   - `javascript±open(url, method, data, callback)`
     联想一下 `javascript±$.ajax()`，可以更好理解这个 API。对于这些参数，需要单独阐述的是 `callback`。`javascript±callback()` 会在页面载入完成后调用，由 `javascript±page.onLoadFinished` 调用（时机晚于 `javascript±page.onLoadFinished`）。这个 `callback` 会接受一个参数 `status`，可能值为 `javascript±'success'` 和 `javascript±'fail'`，指示页面是否加载成功。示例可以参考“简单示例”一节的例子。

8. `javascript±page.close()`
   与 `javascript±page.open()` 对应，调用 `javascript±page.close()` 之后，会释放 page 所占用的内存，我们不可以在此之后再调用 page 实例。在实际的操作中，调用此方法并不会完成清空所占内存；javascript 的垃圾回收机制也不会回收 page 实例。但在实际使用中，常常会遇到将一个 page 实例反复 open 的情况。在一个页面用完后，记得一定要执行 `javascript±page.close()`，这样在下一次 open 的时候，才不会重复分配堆栈空间。

9. `javascript±page.evaluate(fn, [param])`
   对于 page 打开的页面，往往需要与其进行一些交互。`javascript±page.evaluate()` 提供了在 page 打开页面的上下文（下文直接用 page 上下文指代）执行 function 的功能（类比 Chrome 开发者工具的控制台）。如下例：

   ```js
   page.open('http://m.bing.com', function (status) {
     var title = page.evaluate(function (s) {
       return document.querySelector(s).innerText;
     }, 'title');
     console.log(title);
     phantom.exit();
   });
   ```

   在这个例子中，`javascript±page.evaluate()` 接受两个参数，第一个是必需的，表示需要在 page 上下文运行的函数 `fn`；第二个是可选的，表示需要传给 `fn` 的参数 `param`。`fn` 允许有一个返回值 `return`，并且此返回值最终作为 `javascript±page.evaluate()` 的返回值。这边对于刚刚命名的 `param` 和 `return` 有一些额外的说明和注意事项。对于整个 phantom 进程而言，`javascript±page.evaluate()` 是跑在一个沙盒中，`fn` 无法访问一切 phantom 域中的变量；同样 `javascript±page.evaluate()` 方法外部也不应该尝试访问 page 上下文中的内容。那么如果两个作用域需要交换一些数据，只能依靠 `param` 和 `return`。不过限制很大，`param` 和 `return` 必须为能够转化为 JSON 字符串，换言之，只能是基本数据类型或者简单对象，像 DOM 节点、$对象、function、闭包等就无能为力了。
   这个方法是同步的，如果执行的内容对后续操作不具备前置性，可以尝试异步方法以提高性能：`javascript±page.evaluateAsync()`。

10. `javascript±page.render(filename)`
    `javascript±page.render()` 能够把当前页面渲染成图片并输出到指定文件中。输出的文件格式由传入的文件扩展名决定，目前支持 `PNG`、`JPEG`、`GIF`、`PDF`。

    ```js
    var page = require('webpage').create();
    page.open('http://github.com/', function () {
      page.render('github.png');
      phantom.exit();
    });
    ```

    还有其他一些 API 会对 `javascript±page.render()` 产生影响，如：

    - `javascript±page.zoomFactor` Number： 设置缩放比率
    - `javascript±page.clipRect` Object：设置输出的矩形区域，例如：
      ```js
      page.clipRect = {
        top: 14,
        left: 3,
        width: 400,
        height: 300
      };
      ```
      还有一些页面设置参数，如果纸张大小，侧边距等，在此不详述。web page 也支持输出图片 base64 格式的字符串，API 为`javascript±page.renderBase64()`，也不再详述。

11. `javascript±page.sendEvent()`
    为了交互的需要（测试的需要），phantom 允许通过代码模拟一些交互事件（注意与 DOM 事件的区分）。

    - 鼠标事件：
      API：`javascript±sendEvent(mouseEventType[, mouseX, mouseY, button='left'])`
      `mouseEventtype` 可能的取值为：`'mouseup'`、`'mousedown'`、`'mousemove'`、`'doubleclick'` 和 `'click'`，这个参数为必须的。
      后两个参数为鼠标事件的坐标位置。最后一个参数为鼠标按键，只对需要按键的事件有效，默认为 `'left'`，可能值为 `'right'`、`'left'`、`'middle'`。
    - 键盘事件：
      API：`javascript±sendEvent(keyboardEventType, keyOrKeys, [null, null, modifier])`
      `keyboardEventType` 可能的取值为 `'keyup'`、`'keydown'`、`'keypress'`，第2个参数传入一个键值或一个字符串。键值可以通过 [`javascript±page.event.key`](https://github.com/ariya/phantomjs/commit/cab2635e66d74b7e665c44400b8b20a8f225153a) 来查询调用。第三和第四个参数无效，第五个参数表示同时按下的修饰键。取值情况如下：
      - `0`: 未使用修饰键
      - `0x02000000`: Shift 键被按下
      - `0x04000000`: Ctrl 键被按下
      - `0x08000000`: Alt 键被按下
        看一个示例：`javascript±page.sendEvent('keypress', page.event.key.A, null, null, 0x02000000 | 0x08000000);`

12. `javascript±page.switchToFrame(frameName/framePosition)`
    默认 page 对应的是 frame，如果一个页面中还有其他 frame，则可以通过此方法切换 page 对应的 frame。其他类似的方法还有 `javascript±switchToChildFrame()`、`javascript±switchToParentFrame()`、`javascript±switchToFocusedFrame()`、`javascript±switchToMainFrame()` 等，不再赘述。

13. `javascript±page.uploadFile(selector, file)`
    页面中常常会有上传文件的操作，但 phantom 没有界面，因而也就没有办法选择文件上传，通过此方法可以模拟文件上传操作。示例如下：

    ```js
    page.uploadFile('input[name=image]', '/path/to/some/photo.jpg');
    ```

14. 一些事件处理接口
    - `javascript±page.onAlert`：phantom 没有界面，所以也就不能处理 alert 窗口，但可以通过此接口捕获到 alert。
    - `javascript±page.onPrompt`：类似的，phantom 不能处理 prompt 窗口，通过这个接口可以捕获 prompt。
    - `javascript±page.onConfirm`：类似的，phantom 不能处理 confirm 窗口，通过这个接口可以捕获 confirm。
    - `javascript±page.onConsoleMessage`：类似的，phantom 不能显示 console 窗口，通过这个接口可以捕获 console 消息。
      ```js
      var webPage = require('webpage');
      var page = webPage.create();
      page.onAlert = function (msg) {
        console.log('ALERT: ' + msg);
      };
      page.onPrompt = function (msg, defaultVal) {
        if (msg === "What's your name?") {
          return 'PhantomJS';
        }
        // 返回值就是prompt得到的值
        return defaultVal;
      };
      page.onConfirm = function (msg) {
        console.log('CONFIRM: ' + msg);
        // 返回true相当于点击“确定”，返回false相当于点击“取消”
        return true;
      };
      page.onConsoleMessage = function (msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
      };
      ```
    - `javascript±page.onInitialized`：在 page 创建后触发。
    - `javascript±page.onUrlChanged`：在 url 发生变化时触发。它接受新的 url 作为参数。首次加载页面，`javascript±page.onUrlChanged` 是在 `javascript±page.onInitialized` 之后触发。
    - `javascript±page.onNavigationRequested`：如果在 `javascript±page.navigationLocked` 中允许页面跳转，此接口才会有意义（参见 `javascript±page.navigationLocked`）。它接受4个参数，先看示例：
      ```js
      page.onNavigationRequested = function (url, type, willNavigate, main) {
        console.log('Trying to navigate to: ' + url);
        console.log('Caused by: ' + type);
        console.log('Will actually navigate: ' + willNavigate);
        console.log("Sent from the page's main frame: " + main);
      };
      ```
      - `url` 表示要跳转到的 url
      - `type` 表示产生跳转的原因，可能值有 `javascript±'Undefined'`、`javascript±'LinkClicked'`、`javascript±'FormSubmitted'`、`javascript±'BackOrForward'`、`javascript±'Reload'`、`javascript±'FormResubmitted'`、`javascript±'Other'`
      - `willNavigate` 表示是否会跳转，由 `javascript±page.navigationLocked` 控制
      - `main` 表示发生跳转的是否是主 frame，如果是主 frame 则为 true，如果为其他 frame 则为 false
    - `javascript±page.onLoadStarted`：在开始载入资源时触发。
    - `javascript±page.onLoadFinished`：页面所有资源载入完成后触发。其实与 `javascript±page.open()` 的回调函数等价。它接受一个参数 `status`，表示加载是否成功。参见 `javascript±page.open()`。
    - `javascript±page.onClosing`：当在 phantom 域调用 `javascript±page.close()` 或 page 上下文调用 `javascript±window.close()` 时触发。
    - `javascript±page.onError`： 此接口捕获所有 page 上下文发生的 javascript 错误。参数是错误信息和调用堆栈，参见 `javascript±phantom.onError`。如果 page 不处理错误，那么这些错误会冒泡到 phantom 的 onError 处理器。
    - `javascript±page.onCreate`：当 page 创建子窗口时触发，例如在 page 上下文中使用 `javascript±window.open`，但是子窗口再创建子窗口不会触发此事件。
    - `javascript±page.onResourceRequested`：当页面请求一个资源时触发的事件，它接受两个参数，第一个参数是 `requestData` 对象，它有如下属性：
      _ `id` : 资源请求编号
      _ `method` : http 请求方法，get/post 等
      _ `url`：请求的 URL
      _ `time` : 一个 Date object，包含响应接收的时间
      _ `headers` : http 头部的信息列表
      第二个参数是 `networkRequest` 实例，它包含3个方法：
      _ `javascript±abort()`：中断当前的请求。这样做会触发 onResourceError
      _ `javascript±changeUrl(url)`：改变当前请求的目标 url
      _ `javascript±setHeader(key, value)`：修改/添加 http 头部信息
    - `javascript±page.onResourceReceived`：当一个资源请求的响应接收到后触发此事件，它接受一个 `response` 对象，这个对象有如下属性：
      - `id` : 资源请求编号
      - `url`：请求的URL
      - `time` : 一个 Date object，包含响应接收的时间
      - `headers` : http 头部的信息列表
      - `bodySize` : 已接收到的数据大小（全部数据或已接收的部分数据）
      - `contentType` : 指定的内容类型
      - `redirectURL` : 如果是一个重定向响应，那么此处是重定向到的 url
      - `stage` : “start”/ “end”
      - `status` : http 状态码，如：200
      - `statusText` : http 状态描述，如：OK
    - `page.onResourceError`：当资源加载失败时，触发此事件。它接收一个 `resourceError` 对象，这个对象有如下属性：
      - `id`：资源请求的编号
      - `url`：请求的 URL
      - `errorCode`：错误代码
      - `errorString`：错误信息
        可参考如下示例：
      ```js
      page.onResourceError = function (resourceError) {
        console.log(
          'Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')'
        );
        console.log(
          'Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString
        );
      };
      ```
    - `javascript±page.onResourceTimeout`：在讲 `javascript±page.settings` 时曾经提到过这个事件。如果设置了 `javascript±page.settings.resourceTimeout`，并且资源在这个时间内没有载入完成，则会触发此事件，它接受一个 `request` 对象，这个对象包含如下属性：
      - `id` : 资源请求编号
      - `method` : http 请求方法，get/post 等
      - `url`：请求的 URL
      - `time` : 一个 Date object，包含响应接收的时间
      - `headers` : http 头部的信息列表
      - `errorCode`：错误代码
      - `errorString`：错误信息

---

### Child Process 模块

通过 Child Process 模块，我们能创建子进程，借助 `stdin`、`stdout`、`stderr` 来实现进程间通信（很 C++）。使用子进程能够做很多事情，如打印、发邮件、调用脚本或其他程序（不局限于 javascript）。

要使用 Child Process 模块，我们需要在代码中添加 `javascript±require('child_process')`。

> 以下内容缺乏文档支持，并未经过充分测试，可能存在一定的理解偏差。这部分功能是极有用的，希望在项目中使用的时候注意测试。

> Child Process 模块本身应该也并完全开发完全。`javascript±spawn()`、`javascript±execFile()` 可用，`javascript±exec()` 和 `javascript±fork()` 尚未实现。

1. `javascript±spawn(command, [args], [options])`
   最基本的创建进程的方法。前两个参数比较重要，例如现在想从 phantom 进程中运行一段 Node.js 脚本，脚本路径为 `main.js`，这个脚本接受一个参数，假定为 `helloworld`，那么如果想得到这段脚本的运行结果应该怎么做呢？参考下面的脚本：

   ```js
   var spawn = require('child_process').spawn;
   child = spawn('Node.js', ['main.js', 'helloworld']);
   child.stdout.on('data', function (data) {
     console.log('spawnSTDOUT:', JSON.stringify(data));
   });
   child.stderr.on('data', function (data) {
     console.log('spawnSTDERR:', JSON.stringify(data));
   });
   child.on('exit', function (code) {
     console.log('spawnEXIT:', code);
   });
   setTimeout(function () {
     phantom.exit(0);
   }, 2000);
   ```

   其实 `javascript±spawn()` 方法没什么神秘的，它就是运行第一个参数表示的命令，第二个参数就是这个命令的参数列表。所以如果要开启一个新的 phantom 进程，第一个参数为 `phantom` 就行。同样的道理，指定好程序的路径或者是脚本语言解释器的路径，通过这个方法可以做的事情很多。
   比较不方便的是，进程间的通信只能通过 `stdin`、`stdout`、`stderr` 来完成，调用 `javascript±spawn()` 方法后，还需要对这些交互信息进行监听，上面的例子中演示了监听 `stdout` 和 `stderr` 的方法。

2. `javascript±execFile(cmd, args, opts, cb)`
   就像刚刚说的，`javascript±spawn()` 方法稍微感觉有点麻烦，使用 `javascript±execFile()` 能够稍稍简化上面的代码。`javascript±execFile()` 的前三个参数与 `javascript±spawn()` 的三个参数完全一样，不同的是它多了一个 `cb` 回调函数，看一个例子就知道这个回调函数有什么用了：
   ```js
   var execFile = require('child_process').execFile;
   child = execFile('Node.js', ['main.js', 'helloworld'], null, function (err, stdout, stderr) {
     console.log('execFileSTDOUT:', JSON.stringify(stdout));
     console.log('execFileSTDERR:', JSON.stringify(stderr));
   });
   setTimeout(function () {
     phantom.exit(0);
   }, 2000);
   ```
   在 `javascript±execFile()` 中，对 `stdout`、`stderr` 的监听做了封装，简化了我们的代码，不过功能上与 `javascript±spawn()` 并无区别。

---

### file system 模块

虽然与 Node.js 中文件系统模块名称和调用方法（`javascript±require('fs')`）一样，但不得不说，phantom 的文件系统模块总体是比较简单的，API 不多但够用，API 也不同于 Node.js 的异步回调风格，而是采用 stream + 同步的风格，浓浓的 C++ 风味。在使用的时间请一定要注意与 Node.js 的文件系统模块做区分。

1. `javascript±fs.open(path, mode/opts)` File
   `javascript±open()` 方法接受两个参数，第一个参数是要打开的文件路径，第二个参数后面还会见到，这里统一说明。如果是字符串，则代表文件打开的模式，可选的有 `javascript±'r'`、`javascript±'w'`、`javascript±'a/+'`、`javascript±'b'`（read 时仅支持 `javascript±'b'`）；如果是一个对象，则表示配置项，一共有两个配置项，分别是 `mode` 和 `charset`，`mode` 就是刚刚提到的打开模式，`charset` 表示文件的编码类型。参阅下面的示例：

   ```js
   var fs = require('fs');
   var file = fs.open('main.js', 'r');
   console.log(file.read());
   file.close();
   file = fs.open('main.js', 'a');
   file.write('123');
   file.close();
   setTimeout(function () {
     phantom.exit(0);
   }, 2000);
   ```

   对打开的文件，我们可以进行读写操作（具体使用与打开模式有关）。如果对一个文件执行了 open，请别忘了在文件使用完成后，再对其执行 close。

2. `javascript±fs.read(path, mode/opts)` String
   `javascript±fs.read()` 方法对文件读取做了封装，不必关心文件的打开关闭，返回值为文件内容。

3. `javascript±fs.write(path, content, mode/opts)`
   `javascript±fs.write()` 方法对文件写入做了封装，不必关心文件的打开关闭。

4. 其他API:
   - `javascript±fs.size(path)` Number：获取文件大小
   - `javascript±fs.copy(source, destination)`：复制文件
   - `javascript±fs.copyTree(source, destination)`：复制目录树
   - `javascript±fs.move(source, destination)`：移动文件
   - `javascript±fs.moveTree(source, destination)`：移动目录树
   - `javascript±fs.remove(file)`：删除文件
   - `javascript±fs.removeTree(path)`：删除目录
   - `javascript±fs.join(partialPath[])` String：组合路径
   - `javascript±fs.split(path)` String[]：切割路径
   - `javascript±fs.exist(path)` Boolean：文件或目录是否存在
   - `javascript±fs.isFile(path)` Boolean：指定路径是否是文件
   - `javascript±fs.isDirectory(path)` Boolean：指定路径是否是目录
   - `javascript±fs.list(path)` String[]：获取指定目录下的文件/目录名称列表

---

### System 模块

在文档一开始就已经提到过 system 模块，一开始的例子中，我们使用了 system 模块提供的 `args` 属性。现在重新来认识一下 system 模块。system 模块主要管理着一些与运行环境有关的属性。

1. `javascript±system.args` String[]
   获取运行 phantomjs 时传入的所有参数，这个不再赘述。

2. `javascript±system.env` Object
   获取当前的环境信息。包含操作系统信息、环境变量信息等等。通过下面的代码来查看一下吧：

   ```js
   var system = require('system');
   var env = system.env;
   Object.keys(env).forEach(function (key) {
     console.log(key + '=' + env[key]);
   });
   setTimeout(function () {
     phantom.exit(0);
   }, 2000);
   ```

3. `javascript±system.os` Object
   获取操作系统信息，返回一个简单对象，这个对象有3个属性：`architecture`：架构，如 “32bit”；`name`：操作系统名称；`version`：操作系统版本。

4. `javascript±system.pid` Number
   获取当前进程的pid。

5. `javascript±system.platform` String
   永远返回`'phantomjs'`

---

### Web Server 模块

phantomjs 支持一个简单的 web server 模块，`javascript±require('webserver')` 即可引入。web server 模块基于 [mongoose](https://code.google.com/p/mongoose/)。不过最好不要在生产环境使用这样的服务器模块，因为现阶段此模块仅允许10个并发请求。

看一个简单的例子吧：

```js
var webserver = require('webserver');
var server = webserver.create();
var service = server.listen(8080, function (request, response) {
  response.statusCode = 200;
  response.write('<html><body>Hello!</body></html>');
  response.close();
});
```

首先需要创建服务器实例，然后调用 `javascript±listen()` 方法监听，`javascript±listen()` 方法的第一个参数可以为一个端口号，也可以用 `ip:port` 这样的 ip + port 组合方式。第二个参数是处理请求的回调方法。下面描述一下 `request` 和 `response` 两个对象。

- request：

  - `method`：http 请求的方法，get、post 等
  - `url`: 包含 http 请求 URL 和 get 请求的 query string（如果有的话）
  - `httpVersion`：当前采用的 http 协议的版本
  - `headers`：所有 http 请求头部信息，以键值对的形式提供
  - `post`：请求主体，仅对 post 和 put 方法的请求有效
  - `postRaw`：如果 Content-type 为 `'application/x-www-form-urlencoded'`（表单上传的默认值）时，post 的原始信息会暂存在此属性中。

- response：

  - `headers`：以键值对的形式保存所有的HTTP请求头部的信息，在第一次调用 `javascript±write()` 方法前一定要设置
  - `javascript±setHeader(name, value)`：设置或添加特定的头部信息
  - `javascript±header(name)`：获取特定的头部信息
  - `statusCode`：设置HTTP状态码
  - `javascript±setEncoding(encoding)`: 标明传给 `javascript±write()` 的数据需要转换成什么格式，默认为 UTF-8。如果数据为二进制字符串，则设置为 “binary”
  - `javascript±write(data)`：向 response 中发送数据块，可以多次调用
  - `javascript±writeHead(statusCode, headers)`：向 response 中发送响应头部。`statusCode` 是一个3位数字，表示 HTTP 状态码（如404）。后一个参数代码响应头部
  - `javascript±close()`：关闭 HTTP 连接

    - 为了避免客户端检测到连接中断，记得最后再用 `javascript±write()` 方法发送一个空字符串（如：`javascript±response.write('')`）。
    - `javascript±closeGracefully()`：功能与 `close()` 一样，不过更安全可靠，它能保证响应头部先发送，并自动在响应最后加上 `javascript±response.write('')`
