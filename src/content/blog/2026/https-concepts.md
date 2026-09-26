---
title: HTTPS 该搞清楚的几件事
tags:
  - HTTPS
  - 安全
  - 网络
category: 技术
hero: ./https-concepts-hero.jpg
heroCopyright: Photo on <a href="https://unsplash.com/photos/m_HRfLhgABo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-05-07 22:36:16
---

说到 HTTPS，很多人会说：这不就是加了锁的 HTTP 吗。是的，不过锁背后其实是三件事叠在一起——传输加密、内容完整、服务器身份可验证。缺一截，浏览器警告或中间人空间就会回来。这篇只想把协议、证书、加密套件、HSTS、OCSP 和落地配置串成一条能动手的线。

## HTTP 和 HTTPS 差在哪一层

| | HTTP | HTTPS |
|--|------|--------|
| 端口 | 80 | 443 |
| 载荷 | 明文 | TLS 加密 |
| 证书 | 不需要 | 需要 |
| 浏览器 | 常标不安全 | 锁图标 |
| SEO | 搜索引擎倾向降权明文站 | 有 HTTPS 是基本门槛 |
| 性能 | 无握手成本 | 有握手；现代栈下体感多可忽略 |

粗流程：客户端请求 → 服务器给证书（常连带中间证）→ 客户端校验有效期 / 主机名 / 签名 / 链 / 撤销 → 协商会话密钥 → 对称加密传数据。非对称贵，对称便宜，所以只在握手阶段用公钥体系。有人会问：那性能是不是 HTTPS 的硬伤？对我来说，TLS 1.3、会话复用、HTTP/2/3 之后，真正拖慢页面的往往还是资源体积和后端，而不是「多了一层加密」。

## SSL 该进博物馆了，TLS 也分代

SSL 和 TLS 名字常被混着说。可是产品文档里写 SSL，指的多半已经是 TLS。

| 版本 | 年份 | 现状 |
|------|------|------|
| SSL 2.0 / 3.0 | 1995 / 1996 | 废弃（POODLE 等挂在 SSL 3.0） |
| TLS 1.0 / 1.1 | 1999 / 2006 | 废弃（BEAST 等挂在旧 TLS） |
| TLS 1.2 | 2008 | 仍广泛使用，底线 |
| TLS 1.3 | 2018 | 推荐默认 |

Nginx 里至少：

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
ssl_prefer_server_ciphers off;
```

TLS 1.3 下很多套件选择由实现自动收敛，运维少拧旋钮。`ssl_prefer_server_ciphers off` 在 1.2 上让客户端挑更合适的（例如移动端偏 ChaCha20），一般比「服务器硬点最贵套件」更稳。

## TLS 握手：1.2 和 1.3 差在往返

很多人以为握手就是「服务器把证书丢过来」。可是真正贵的是往返次数，以及密钥交换怎么塞进这些往返。

### TLS 1.2：大约 2-RTT 才能开传

简化时序（省略部分证书相关消息）：

```text
客户端                                服务器
  |--- ClientHello ------------------>|
  |    支持的版本、加密套件、扩展        |
  |<-- ServerHello -------------------|
  |    选定版本、套件、证书、ServerKey  |
  |--- ClientKeyExchange ------------>|
  |    预主密钥（用服务器公钥加密）      |
  |--- ChangeCipherSpec / Finished -->|
  |<-- ChangeCipherSpec / Finished ---|
  |=== 应用数据开始加密 ===============|
```

ClientHello 里带支持的协议版本和套件列表；ServerHello 选定其一，并附上证书（通常还有中间证）。随后客户端生成预主密钥，用服务器公钥包过去；双方各自算出主密钥和会话密钥，再交换 Finished 做完整性确认。

旧办法有多麻烦：每多一次往返，跨洋用户就能多出几十到上百毫秒。移动网络上更明显。

### TLS 1.3：常见约 1-RTT

```text
客户端                                服务器
  |--- ClientHello ------------------>|
  |    含密钥共享（key_share）等        |
  |<-- ServerHello + 证书 + Finished -|
  |    （握手消息本身也可加密）         |
  |=== 应用数据可开始 =================|
```

密钥材料提前塞进 ClientHello，服务器一轮就能完成密钥协商并回证书。弱算法被砍掉一批，前向保密（Forward Secrecy）也更干净——会话密钥不依赖长期私钥的「可解密历史」。

0-RTT 还能把早期数据提前发出去，但对重放敏感。对我来说，API 写请求别轻易开 0-RTT；读多、可幂等的场景再考虑。

## 证书在证明什么

证书把域名（以及可选组织信息）绑到公钥，由 CA 链背书。你可以：

```bash
openssl x509 -in cert.pem -text -noout
```

典型字段：`Issuer`、`Validity`、`Subject`、`Subject Alternative Name`、`Key Usage` / `Extended Key Usage`（TLS Web Server Authentication）、公钥算法（RSA 2048 或 ECDSA）。Subject 里的 CN 今天几乎只是遗迹；浏览器认的是 **SAN**。配证时务必把要用的主机名写进 SAN，别只改 CN 就以为够了。

### 验证级别

| 级别 | 验什么 | 速度 | 适用 |
|------|--------|------|------|
| DV | 域名归属 | 分钟级 | 个人站、多数产品 API |
| OV | 域名 + 组织 | 天级 | 企业站要在证里露公司名 |
| EV | 更严的组织核验 | 可到周级 | 金融 / 强合规话术 |

绿色地址栏在很多浏览器里早已弱化。对我来说，别再把 EV 当「用户一眼更信任」的营销卖点；合规合同点名了再买。证书选型本身另有一篇写免费和商业怎么选。

### 覆盖范围

- **单域名**：`example.com`
- **SAN 多域名**：`example.com`、`api.example.com`、`admin.example.com`（一张证挂多个不同主机名）
- **通配符**：`*.example.com` 覆盖一级子域，一般**不含** `a.b.example.com`，也不自动等于裸域 `example.com`（裸域要另加）

通配符省的是「子域很多、主机名事先不定」的运维，不是「更安全」。私钥面更大，泄露影响面也更大。

## 证书链：叶证 alone 不够

```text
根 CA（系统 / 浏览器预装）
  ↓
中间 CA（服务器应下发）
  ↓
叶证书（你的站点）
```

例如 Let's Encrypt：`ISRG Root X1` → `R3`（或后续中间）→ `example.com`。根证客户端本地有；中间证要靠服务器在握手里带上。只配叶证、不配 `fullchain`，部分客户端验链会失败——手机、旧库、某些 Java 客户端特别容易踩。

客户端大致检查顺序：

1. 有效期是否在窗口内  
2. 主机名是否落在 SAN  
3. 签名算法与签名是否正确  
4. 链是否落到信任根（中间是否齐全）  
5. 撤销状态（OCSP / CRL；有 stapling 则先看钉上的响应）  

任一步失败，浏览器就会红。运维侧最常见的人为事故是：续期只换了叶证、中间路径断了，或证书过期了 HSTS 还卡着。

## 对称、非对称、混合、套件名

对称（AES-GCM、ChaCha20-Poly1305）：快，密钥分发难。常用 AES-128-GCM / AES-256-GCM，以及移动端常更香的 ChaCha20-Poly1305。  
非对称（RSA 2048/4096、ECDSA、Ed25519）：好分发，慢。  
HTTPS：非对称（或 ECDHE）换会话密钥，对称传业务数据——这就是混合加密。

加密套件名字可以拆开看（TLS 1.2 风格）：

```text
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
     |     |         |           |
   密钥交换  认证     对称加密      握手 MAC
```

TLS 1.3 套件名单更短，AEAD 成标配。配置上优先 ECDHE + AEAD，禁用 RC4、DES、3DES、导出套件、匿名 DH。只禁了套件名、却还开着 TLS 1.0，等于没禁干净。

## HSTS：强制以后只走 HTTPS

HSTS（HTTP Strict Transport Security）是一种响应头策略：浏览器记住之后，即使用户敲 `http://`，也会直接按 HTTPS 走，少一次可被剥离的明文跳转。

首次成功的 HTTPS 响应可以带：

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| 参数 | 含义 |
|------|------|
| `max-age` | 策略有效秒数；`31536000` ≈ 1 年 |
| `includeSubDomains` | 扩到所有子域 |
| `preload` | 表示你打算进浏览器预置列表 |

Nginx：`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`（Apache 用 `Header always set …` 同值即可）。

### 分阶段 rollout，别一步拉满

```nginx
# 1. 先短窗观察（约 1 周）
add_header Strict-Transport-Security "max-age=604800" always;

# 2. 稳定后拉到约 1 个月
add_header Strict-Transport-Security "max-age=2592000" always;

# 3. 确认无误再拉到 1 年
add_header Strict-Transport-Security "max-age=31536000" always;

# 4. 所有子域都 HTTPS 后才加 includeSubDomains
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# 5. 最后才考虑 preload（可选，谨慎）
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

申请 preload 前对照 [hstspreload.org](https://hstspreload.org/)：有效证、全子域 HTTPS、`max-age ≥ 31536000`、带 `includeSubDomains` 与 `preload`。加入预加载列表几乎很难快速撤销，移除可能要数月。证书过期时，HSTS 站点可能比「还能点高级绕过」更绝——这是特性也是风险。

对我来说，HSTS 的收益是挡住 SSL 剥离；成本是续期纪律必须硬。续期不稳就先别 `preload`，甚至先别 `includeSubDomains`。

## 其他响应头：和 TLS 正交，但常一起配

TLS 管传输；这些头管浏览器行为。常见一组：

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
# CSP 按业务收紧，别抄一条 unsafe-inline 就当完事
# add_header Content-Security-Policy "default-src 'self'; ..." always;
```

| 头 | 管什么 | 备注 |
|----|--------|------|
| `X-Frame-Options` | 点击劫持 / iframe | `DENY` / `SAMEORIGIN`；`ALLOW-FROM` 已废 |
| `X-Content-Type-Options` | MIME 嗅探 | 固定 `nosniff` |
| `Referrer-Policy` | Referer 怎么发 | 常用 `strict-origin-when-cross-origin` |
| `Permissions-Policy` | 传感器 / 摄像头等 | 按功能关掉不用的 |
| CSP | 资源来源 | 主防线；`frame-ancestors` 可替代部分 XFO |
| `X-XSS-Protection` | 旧 XSS 过滤器 | 已过时，现代浏览器靠 CSP |

点击劫持优先 `frame-ancestors`，`X-Frame-Options` 可作过渡。细节另一篇写防护栈时再展开。

## OCSP Stapling：别让每个访客去问 CA

传统 OCSP：浏览器直询 CA「这张证吊销了吗」。问题有三：隐私（CA 知道谁在看哪站）、延迟（多一跳）、可用性（OCSP 端点挂了，策略严的客户端会难受）。

Stapling：服务器定期自己拉状态，握手时把带签名的 OCSP 响应「钉」在证书旁。客户端验的是这份响应，不必再出站问 CA。

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
resolver 8.8.8.8 1.1.1.1 valid=300s;
resolver_timeout 5s;
```

`ssl_trusted_certificate` 要用能验 OCSP 签名的链（常见是中间+根或 CA 提供的 chain）。验证：

```bash
openssl s_client -connect example.com:443 -servername example.com -status < /dev/null 2>&1 \
  | grep -A2 "OCSP Response Status"
```

期望看到 `successful`。若一直没有 stapling，先查解析器、中间证路径、以及服务器出站是否拦了 OCSP URL。

## 一份可抄的 Nginx 骨架

```nginx
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    resolver 8.8.8.8 1.1.1.1 valid=300s;
    resolver_timeout 5s;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}
```

`fullchain.pem` 不是装饰。会话票据（`ssl_session_tickets`）在多机轮换密钥没设计好时会伤前向保密，单机可先关，或按发行版文档管 ticket key。HTTP/2 用 `listen 443 ssl http2`；后面上 HTTP/3 再另开 `quic` 监听。路径、域名一律按你自己的站改，别把示例域名原样搬进生产。

## 怎么验

**SSL Labs**：[ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/) —— 看证书有效性、协议、套件、已知漏洞、综合分（A+ / A / B / C / F）。

**testssl.sh**：`./testssl.sh example.com`（仓库 [drwetter/testssl.sh](https://github.com/drwetter/testssl.sh)），命令行扫弱套件与旧协议。  
**nmap**：`nmap --script ssl-enum-ciphers -p 443 example.com`。

对我来说，上线后先跑一遍 SSL Labs，看链和协议两项有没有红字；改完配置再扫一次，别只信「reload 成功」。

## 常见漏洞与对应旋钮

| 问题 | 大致挂在哪 | 你这边怎么挡 |
|------|------------|--------------|
| SSL 剥离 | 中间人把 HTTPS 降成 HTTP | HSTS + 全站 301，别只靠「用户记得敲 https」 |
| Heartbleed | 旧 OpenSSL 1.0.1–1.0.1f | 升级 OpenSSL / 发行版包，换过私钥的要重签 |
| POODLE | SSL 3.0 | 禁用 SSL 3.0（今天应早已关掉） |
| BEAST | TLS 1.0 | 只用 TLS 1.2+ |
| 弱套件 | RC4、DES、3DES、导出套件 | 显式 cipher 列表 + 禁旧协议 |

只关套件名、却还开着 TLS 1.0，等于没关干净。证书链缺中间、HSTS 开了续期挂了、stapling 配了但 resolver 不通——这些比「听说过某个 CVE 名字」更常在现网炸。

## 性能旋钮与收口清单

性能侧常一起拧：HTTP/2、会话缓存、OCSP Stapling、TLS 1.3、链完整但别塞多余证。证书自动续期是否**真的成功**，比「曾经申请到过」重要；续期监控比再抠一档 cipher 更值钱。

收口前可以勾一遍：

- [ ] TLS 1.2+ 已开，SSL 2/3、TLS 1.0/1.1 已关  
- [ ] 强套件（ECDHE + AEAD），无 RC4 / 3DES / 导出套件  
- [ ] `fullchain` 完整，SSL Labs 链无红  
- [ ] HSTS 已按阶段 rollout（别一步 preload）  
- [ ] 常用安全头已配；CSP 按业务收紧  
- [ ] OCSP Stapling 开启且 `openssl … -status` 能看到 successful  
- [ ] HTTP→HTTPS 301；会话缓存合理  
- [ ] 续期自动化 + 到期告警；SSL Labs / testssl 能定期跑  

对我来说，HTTPS 不是装完证书就结束，而是协议版本、证书链、续期、HSTS 分阶段和 stapling 几件事一起收口。下一步你可以先对现网跑一遍 SSL Labs，看链和协议两项有没有红字。
