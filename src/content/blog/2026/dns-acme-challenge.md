---
title: ACME 该搞清楚的几件事
description: Let's Encrypt 背后那套协议：挑战是什么、HTTP-01 和 DNS-01 怎么验，DNS 不在你手里时怎么办。
tags:
  - HTTPS
  - SSL
  - DNS
  - ACME
  - 运维
category: 技术
hero: ./dns-acme-challenge-hero.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@nasa?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">NASA</a> on <a href="https://unsplash.com/photos/Q1p7bh3SHj8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-05-09 10:12:00
---

说到 Let's Encrypt，很多人会说：装个 Certbot，域名过了就出证。是的，不过 Certbot 只是客户端。背后那套协议叫 [ACME](https://datatracker.ietf.org/doc/html/rfc8555)——证书机构并不认识你这个人，它只在下单时出一套挑战，你证明自己管着证书里那些域名，它才签发。

这篇就介绍 ACME：它在验什么，HTTP-01 够用时怎么走，不够用时 DNS-01 怎么摆，以及 DNS 权限在别人手里时怎么拆。机制大图参考 Carl Winbäck 的 [Using DNS for responding to ACME challenges](https://hsm.tunnel53.net/article/dns-for-acme-challenges/)。不讲某个客户端怎么点菜单。

## 它不认识你，只认挑战

ACME 里两边很清楚：你这边跑客户端（Certbot、lego、Caddy 都行），对面是 ACME 服务器——Let's Encrypt 是最常见的一家。服务器给你挑战，你把应答放到约定位置，它去核对，对上就出证。

浏览器里那把锁，靠的是这层「域名控制权」，不是靠你填了邮箱。

挑战类型写在 RFC 8555 里。Let's Encrypt 的[说明](https://letsencrypt.org/docs/challenge-types/)比 RFC 好读，机制是同一套。日常主要碰两条：

- HTTP-01：在域名对应的公网 HTTP 上放应答  
- DNS-01：在域名树上写一条 TXT  

还有 TLS-ALPN-01，应答塞在 TLS 握手里。多数公网站，HTTP-01 就够。

## HTTP-01：它能从公网敲到你的 80

服务挂在公网，又能说 HTTP，流程直白。客户端申请证书，服务器给出 token；客户端在约定 URL 上放出应答；服务器从公网来拉这一次，对上就签。

它默认两件事：域名解析到可达的公网地址，并且 80 上有人答。缺一截，挑战就过不去。

TLS-ALPN-01 只是换了载体，逻辑还是「我连得上你的服务，并读到正确应答」。公网站点用 HTTP-01 通常就行。

## 内网或不开 80，HTTP-01 就够不着

按上面的推论，没有公网 HTTP，好像签不了证。可是服务经常不在这个假设里。

地址可能是 `10.2.3.5`，ACME 服务器从公网连不进来。也可能在公网，但你开不出或不想开 80——IRC、SFTP、只做 TLS 的服务都常见。

这时该换的是挑战类型。标准化的下一条路是 DNS-01：验证走 DNS，和业务端口、服务是否在公网脱钩。原文把这叫 out-of-band，意思就是：出证不必再碰你的业务端口。

## DNS-01：应答是一条 TXT

要给 `intranet.contoso.com` 签证书，ACME 服务器会去查：

```text
_acme-challenge.intranet.contoso.com.  TXT  <应答值>
```

客户端（或配套脚本）在 DNS 里建这条记录。值不是随便写的：按 RFC，用挑战里的 `token` 和账号密钥拼出 key authorization，再做 SHA-256，结果放进 TXT。服务器查到、对上，挑战通过。

每次申请和续期都要写、验完最好删。对我来说，这直接推出一件事：DNS 得有 API。Cloudflare、Route53、Cloud DNS 都行，例子而已。没有 API，就只能人手改区——Let's Encrypt 那种九十天窗口里，这等于定时事故。

DNS-01 还有一档能力：通配符。Let's Encrypt 签 `*.example.com`，只认 DNS-01。

```bash
dig +short TXT _acme-challenge.intranet.contoso.com
```

你写入的，应是服务器将要查询的。清理阶段无论成败都删掉 TXT，别把旧值留着和下一次搅在一起。

## DNS 不归你管，不必先抢整域

标准做法是直接在 `_acme-challenge.intranet.contoso.com` 下建 TXT。可是 `contoso.com` 的权威 DNS 常常在另一个团队手里——他们未必愿意把整域钥匙交给你。

不必先吵「把 DNS 给我」。CNAME 可以只交出挑战这一截。

单独准备一个只用来应答 ACME 的域，比如 `contoso-acme-responses.com`。管主域的人加一条：

```text
_acme-challenge.intranet.contoso.com.
  CNAME  intranet.contoso.com.contoso-acme-responses.com.
```

你的客户端往 CNAME 指向的名字写 TXT：

```text
intranet.contoso.com.contoso-acme-responses.com.  TXT  <应答值>
```

服务器查 `_acme-challenge.intranet.contoso.com` 时跟着 CNAME 走，最终读到你控制区里的记录。主域团队授权的是「挑战可以指到别处」；续期和删记录都发生在你自己的 DNS API 上。

## 不另买域名，就委派一块子区

也可以不新注册域，在主域下划一块，例如 `acme-challenges.contoso.com`。主域侧用 NS 把这块指到你选的 DNS：

```text
acme-challenges.contoso.com.  NS  ns-cloud-a1.googledomains.com.
acme-challenges.contoso.com.  NS  ns-cloud-a2.googledomains.com.
```

TXT 会落在类似：

```text
intranet.contoso.com.acme-challenges.contoso.com.  TXT  <应答值>
```

委派成没成，用 dig 看 NS 和 SOA，比盯控制台截图靠谱：

```bash
dig NS acme-challenges.contoso.com
dig SOA acme-challenges.contoso.com
```

CNAME 和 NS 委派各管一层。前者是每个要签的主机名先插一根指针；后者是整块挑战区的权威都在你这边。

## 每个新主机名都要先插针

CNAME 的刺很具体：每多一个主机名，主域管理员都要先加对应的 `_acme-challenge...` CNAME，你才能下单。名字长得快时，发证重新变成等工单。

原文说这种情况可以考虑通配符。我采信。通配符不是更高级，只是少碰「每个名字一次 DNS 变更」。主机名稳，每名一条 CNAME 够用；主机名密，通配符或 NS 委派整块挑战区更省事。

免费证还是收费证怎么选，见[另一篇](/2026/ssl-certs-compare)；协议和套件怎么配，见 [HTTPS 该搞清楚的几件事](/2026/https-concepts)。ACME 这一层，先想清楚服务器碰得到你的哪条通道——80，还是 DNS。
