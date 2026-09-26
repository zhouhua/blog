---
title: 免费证书和收费证书怎么选
tags:
  - HTTPS
  - SSL
  - 运维
category: 技术
hero: ./ssl-certs-hero.jpg
heroCopyright: Photo on <a href="https://unsplash.com/photos/Q1p7bh3SHj8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-05-07 22:38:59
---

一提证书，选项常被收成两堆：Let's Encrypt 一类免费 DV，和每年几十到上千美元的商业证。很多人默认「付费一定更安全」。是的，账单确实更贵——不过现代浏览器里，加密强度和兼容性差距已经很小。真正要选的是续期纪律、验证级别、支持和合规话术。

## 一张表先对齐

| 特性 | Let's Encrypt 等免费 DV | 商业证书 |
|------|-------------------------|----------|
| 价格 | 免费 | 约 $50–$1000+/年，视级别与品牌 |
| 有效期 | 约 90 天 | 常见标 1–3 年；浏览器侧早已限制很长寿命 |
| 验证 | 基本是 DV | DV / OV / EV |
| 通配符 | 支持（DNS-01） | 支持 |
| SAN 多域名 | 支持（有数量上限） | 支持 |
| 浏览器兼容 | 现代环境 99%+ | 同左；旧嵌入式偶有差异 |
| 自动续期 | ACME 成熟 | DV 可 ACME；OV/EV 难全自动 |
| 技术支持 | 社区 / 文档 | 工单 / 电话 |
| 保险赔付 | 无 | 宣传额度从万到百万级（实际理赔少） |
| 签发速度 | 分钟级 | DV 快；OV/EV 天到周 |
| 撤销 | 免费 | 免费 |
| 透明度 | CT 日志公开 | 同样进 CT；管理台体验看 CA |

加密算法、根信任、TLS 握手本身，**不**因为「免费」就弱一档。差别在产品形态：你买不买人工核验、坐席和合同里的那一页。

## Let's Encrypt：强在哪

### 成本是零

十个域名也是零。对照粗账：

| 类型 | 年成本量级（示意） |
|------|-------------------|
| Let's Encrypt | $0 |
| 商业 DV | $50–200 |
| 商业 OV | $200–500 |
| 商业 EV | $500–1500 |

十个域名挂满商业证，一年可以到几百到上万；LE 仍是零。钱差的是「你愿不愿意养 ACME」，不是「HTTPS 才合法」。

### 自动化程度高

Certbot 一类工具可以一条命令签 + 配 Nginx：

```bash
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --deploy-hook "systemctl reload nginx"
```

签发快、通配符可用、CT 日志透明。现代 Chrome / Firefox / Safari / Edge、较新的 iOS / Android 都没问题；真正吃亏的是很老的 XP SP2、老 Android、老 iOS——多数业务早不背这些包袱。

通配符要走 DNS-01（手动或 API 插件）：

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d example.com -d '*.example.com'
```

生产环境别长期停在 `--manual`；接到 DNS 提供商插件或 ACME 客户端上，续期才能睡得着。

### 开源、透明

签发记录进 CT；客户端与文档社区活跃。出了问题你对着日志和 rate limit 排，而不是等坐席回邮件——这既是优势也是刺。

## Let's Encrypt：刺在哪

### 90 天

续期失败会变成线上事故。必须自动化，并且要有监控：到期前天数告警、`renew` 是否成功、`deploy-hook` 是否真重载了进程。只靠「服务器上好像有个 cron」不够。

```cron
# 示例：半天试一次；certbot 自己会判断是否临近到期
0 */12 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

干跑验证：`sudo certbot renew --dry-run`。

### 没有坐席

文档和 [社区论坛](https://community.letsencrypt.org/) 是主路径；GitHub Issues 也能翻到常见坑。故障要自己对着日志排。

### 只有 DV

证书里不会出现公司法定名称那一套。要 OV/EV，免费体系给不了。金融话术、采购合同点名商业 CA 时，这条就到头了。

适用大致是：个人站、博客、API、中小产品、测试环境。金融机构、合同点名 EV 的场景，别硬撑「技术上也能开 TLS」。

### 无保险赔付

证书签发错误导致第三方损失时，LE 没有商业那套宣传额度。实际赔付案例在业界本来就少；对我来说，别把「有没有保险」当选型主轴，也别假装「没保险所以不安全」。

### 速率限制（要提前算）

官方限制会变，常见量级大致是（下单前以官网为准）：

| 限制 | 量级 |
|------|------|
| 每注册域每周证书数 | 约 50 |
| 每账号每 3 小时待处理授权 | 约 300 |
| 每 IP 每 3 小时新账号 | 约 10 |
| 单张证域名名额 | 约 100 |

大规模签发或对着生产环境疯狂重签容易撞墙。测试请走 staging：

```bash
certbot --staging -d example.com
```

staging 的证不被浏览器信任，只用来验流程。别把 staging 证装进生产还奇怪「为什么红锁」。

适合：个人站、博客、API、中小产品、测试环境、有 DevOps 能养 ACME 的团队、技术驱动、开源友好的公司。

## 付费买的是什么

加密「更强」通常不是主因。你买的往往是：

### 1. 验证级别

**DV**：只验域名，几分钟，$50–200/年量级——和 LE 在密码学上同层，差在品牌与支持。  
**OV**：域名 + 组织，Subject 可带 `O=Example Inc.`，签发 1–3 天，$200–500。  
**EV**：文件、电话、有时更重核验，1–2 周，$500–1500；部分场景合规点名。部分浏览器曾显示绿色地址栏，如今多数已弱化。

```text
Subject: CN=example.com, O=Example Inc., L=San Francisco, ST=California, C=US
```

EV 核验常见要公司注册文件、执照、电话；个别情况还有更重的线下核验。这和 LE 的分钟级 ACME 不是同一类产品。

### 2. 更长的「名义」有效期

标 1–2 年甚至 3 年的产品还在卖。不过 2020 年后浏览器侧把可接受寿命压到大约 **398 天** 量级——多年证常常是「自动续」包装，不是一张证挂三年不管。对我来说，别把「三年不用续」写成运维假设。

### 3. 支持与管理台

电话 / 工单（有的宣传 24/7）、批量签发、生命周期、合规报告、和负载均衡 / CDN 控制台的集成。紧急问题响应可能是小时级，一般问题一天内——以合同 SLA 为准，别只看营销页。团队 dig 不动 ACME 时，这层才值钱。

### 4. 保险与品牌

粗量级：DV 宣传 $10K–$50K，OV $100K–$500K，EV $1M–$1.75M。真用到的案例少，理赔条件苛刻（签发错误、身份验证失败导致第三方损失一类）。额度好看，别当核心决策依据。

### 5. 极端老客户端

少数嵌入式、老 Java、极旧 Android / XP SP2 才可能成为理由。先量一下真实流量里还有没有这类 UA。

### 6. 企业级功能

证书管理平台、批量签发、API、生命周期、合规报告——大型组织才会真正用满。

代价：钱；OV/EV 签发慢；和 CI 全自动续期不如 LE 顺；换 CA 有迁移与合同成本。供应商锁定、价格不透明、合同约束，都要算进总账。

适合：强合规点名商业 CA、金融 / 强品牌要 OV/EV、团队养不起 ACME、必须有人值班答证书问题、传统行业要人工支持、特殊兼容性需求。

## 商业 CA 怎么挑（粗粒度）

价格会变，下表是量级对照，下单前以官网为准：

| CA | 大致定位 | DV / OV / EV 年价量级 | 更适合 |
|----|----------|----------------------|--------|
| DigiCert | 企业支持上沿、价也高 | ~$218 / $399 / $595 | 要坐席、保险话术、管理台 |
| Sectigo（原 Comodo） | 性价比、功能全 | ~$59 / $199 / $299 | 预算紧但仍要 OV/EV |
| GlobalSign | 欧系合规、企业功能 | ~$249 / $349 / $599 | 国际化 / 合规叙事 |
| GeoTrust（DigiCert 旗下） | 中端 | ~$149 / $299 / $499 | 要 DigiCert 系又不想顶配价 |

粗价再拆一层（示意，含通配符 / 多域）：

| 形态 | DV | OV | EV |
|------|-----|-----|-----|
| 单域名 | $50–200 | $200–500 | $500–1500 |
| 通配符 | $100–300 | $400–800 | $1000–2000 |
| 多域名（约 5 个） | $150–400 | $500–1000 | $1500–3000 |

选型看：你要的验证级别、是否要通配符、工单响应、和现有 LB / CDN 的集成，而不是只看官网报价页第一行。国内业务若还要本地发票与对公流程，把「谁能开票、谁能进采购名录」也算进总账。

## 按场景算账

### 场景 1：个人博客——1 域 DV

| 方案 | 年成本 | 5 年 |
|------|--------|------|
| Let's Encrypt | $0 | $0 |
| Sectigo DV | ~$59 | ~$295 |
| DigiCert DV | ~$218 | ~$1,090 |

对我来说：直接 LE。

### 场景 2：初创——5 域 DV + 要自动化

| 方案 | 年成本 | 5 年 |
|------|--------|------|
| Let's Encrypt | $0 | $0 |
| Sectigo DV（多域） | ~$150 | ~$750 |
| DigiCert DV（多域） | ~$800 | ~$4,000 |

能养 ACME → LE。养不起 → 便宜商业 DV，别一上来 DigiCert 顶配。

### 场景 3：中型企业——要 OV、证里露公司名

| 方案 | 年成本 | 5 年 |
|------|--------|------|
| Let's Encrypt | 不支持 OV | — |
| Sectigo OV（约 10 域量级） | ~$2,000 | ~$10,000 |
| DigiCert OV（约 10 域量级） | ~$4,000 | ~$20,000 |

LE 不支持 OV。这时付费买的是验证级别，不是「HTTPS 才合法」。预算紧时 Sectigo / GeoTrust 一类通常比 DigiCert 省一截。

### 场景 4：金融机构——主域 EV + 子域 OV + 要坐席

| 方案 | 年成本 | 5 年 |
|------|--------|------|
| Let's Encrypt | 不支持 EV/OV | — |
| DigiCert（1 EV + 约 10 OV） | ~$4,600 | ~$23,000 |
| GlobalSign（1 EV + 约 10 OV） | ~$4,100 | ~$20,500 |

LE 在合规话术上经常直接出局。DigiCert / GlobalSign 比价看支持 SLA，不看谁家 slogan 更响。对我来说，选支持更稳的那家，比抠几百刀年费更划算。

## 混合方案往往更划算

### 主站付费、子域 / API 免费

- `www.example.com`、`example.com` → 商业 OV/EV  
- `api.example.com`、`admin.example.com`、`*.dev.example.com` → Let's Encrypt  

示意账：商业 EV 约 $595/年 + LE $0，对比「全家商业」两千刀以上，一年常能少一千多。主站一年几百刀，后面一串子域零成本。

### 生产付费、开发免费

- 生产：`www.example.com`、`api.example.com` → 商业 OV  
- 开发：`dev.example.com`、`staging.example.com`、`*.test.example.com` → LE  

别让测试环境的乱签撞上生产账号的 rate limit——账号分开更干净。

通配符两边都有，**不是**付费的充分理由。域名多、环境多时，用「运维人力 + 故障成本」算总账，不要只看标价。

## 决策树（可执行版）

```text
需要 EV？
  是 → 商业（DigiCert / GlobalSign 等）
  否 → 需要 OV（证里要组织名 / 合规点名）？
         是 → 商业（Sectigo / GeoTrust 等）
         否 → 必须有人值班答证？
                是 → 商业 DV 也可（DigiCert 一类）
                否 → 有 ACME + 监控？
                       是 → Let's Encrypt
                       否 → 先补自动化，或买最便宜的商业 DV 过渡（Sectigo 一类）
```

## OV / EV 签发流程有多长

商业 OV/EV 不是「填邮箱就出证」。常见链路：

```text
提交申请 → 交公司文件 / 执照 → 邮件或 DNS 验域
  → 电话核验 → 人工审核 → 出证（OV 常 1–3 天，EV 可到 1–2 周）
```

着急上线又卡在 OV 时，临时先挂 DV（含 LE）开 HTTPS，OV 下来再换链——前提是业务允许「证里暂时没有组织名」。采购周期和证书签发周期要叠着排，别只留「上线前一天再买」。

## 迁移：两条方向都走一遍

### 商业 → Let's Encrypt

1. 评估还要不要 OV/EV、要不要坐席、有没有自动化能力  
2. 测试环境：`certbot --staging` 或独立子域验流程  

```bash
sudo certbot --nginx -d test.example.com
curl -I https://test.example.com
```

3. `sudo certbot renew --dry-run`  
4. 生产签发，确认 `fullchain` 与站点名  

```bash
sudo certbot --nginx -d example.com -d www.example.com
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -subject -dates
```

5. 监控到期天数 + renew 失败告警，再停商业续费  

### Let's Encrypt → 商业

1. 选 CA 与验证级别，走核验  
2. 备份现有 `/etc/letsencrypt` 或当前 pem  

```bash
sudo cp -r /etc/letsencrypt /backup/letsencrypt-$(date +%F)
```

3. 安装商业证与链，改 Nginx 路径  

```nginx
ssl_certificate     /path/to/commercial/fullchain.pem;
ssl_certificate_key /path/to/commercial/privkey.pem;
```

4. **关掉** certbot timer / cron，避免两套续期抢配置  

```bash
sudo systemctl disable --now certbot.timer
```

5. SSL Labs 再扫一遍链是否完整  

CDN / 负载均衡终止 TLS 时，证书往往装在边缘而不是源站 Nginx——迁移清单要以「谁对外握 443」为准，别只改了源站。

## 监控：免费方案真正贵的地方

LE 的钱是零，运维不是。最低要有：

- 证书 Not After 提前 N 天告警（黑盒探活或读本地 pem）  
- `renew` 退出码 / 日志进告警  
- 部署 hook 失败单独报（签成功但没 reload 等于没签）  
- 定期 SSL Labs 或 `testssl`，防中间证轮换后链断  

商业证同样要监控；只是 90 天窗口更短，对自动化更苛刻。对我来说，选 LE 等于选「我愿意养这条流水线」。

## 几个常被问错的问题

**Q1：LE 安全性是不是差一点？**  
加密与浏览器信任同一套标准；差在验证级别（仅 DV）、有效期（90 天）、附加服务（无坐席）。不是「免费所以弱一档」。

**Q2：为什么 LE 能免费？**  
非营利、由 Mozilla、Chrome、Cisco、大型科技公司等赞助推动全网 HTTPS；不是「没人背锅所以白送」。

**Q3：免费影响 SEO 吗？**  
搜索引擎看的是 HTTPS 有没有，不是 CA 商标。Google 不因为你用了商业证就多给一分。

**Q4：银行 / 金融能不能用 LE？**  
技术上能开 TLS；合规、EV、保险话术、专业支持要求常常不允许你只靠它。不推荐当唯一方案。

**Q5：商业证书的保险有用吗？**  
理论上有，实务少；理赔条件苛刻、举证难，很多时候更像营销话术。别当选型主轴。

**Q6：通配符是不是该买商业的？**  
两边都有通配符。该问的是 DNS-01 自动化你能不能稳住，不是商标。

| 场景 | 更常落哪边 |
|------|------------|
| 个人 / 小项目 | Let's Encrypt |
| 初创、多环境、能自动化 | Let's Encrypt |
| 中型：主站要组织名 | 商业 OV + 子域 LE |
| 大型 / 金融 | 商业 EV（主站）+ 商业 OV（子站）+ LE（开发 / 测试） |
| 无 ACME 能力、要人值守 | 商业 DV 也行，先买时间 |

关键决策因素收成五条：预算紧 → LE；要 OV/EV → 商业；技术能力强、能养 ACME → LE；合规严 → 商业；品牌要在证里露公司名 → 商业 OV/EV。

证书选型很少是密码学问题，更多是：**续期会不会在半夜炸，炸了有没有人能修。** 能把 ACME 和告警跑稳，对我来说优先免费 DV；合同点名 OV/EV 或必须有坐席，再付钱买那一层。
