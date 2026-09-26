---
title: 优化 GitHub 到国内云服务器的部署速度
tags:
  - CI
  - Docker
  - DevOps
category: 技术
hero: ./ci-cross-border-transfer-hero.jpg
heroCopyright: Photo by <a href="https://unsplash.com/@comparefibre?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Compare Fibre</a> on <a href="https://unsplash.com/photos/blue-and-white-light-illustration-9HGPvHThNME?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-09-24 10:00:00
---

我们的部署很朴素：GitHub Actions 在托管 Runner 上打包，再把产物同步到阿里云 ECS。很长一段时间里能用，也没人天天盯传输那一步。

直到最近网络突然变差。同样是一两百兆的 `docker save` tar，公网 SSH / `rsync` 往 ECS 推，经常几十分钟；差的时候一两个小时，偶尔直接挂死，后面的部署也跟着堵。中位数偶尔还行，长尾已经没法装看不见。

业务细节略过，只记我们怎么改的。

## 通道和载荷，两件事

表面上是上传慢。可就算通道修好了，你还是在把完整镜像从 Runner 搬到 ECS——而它本来可以在目标机上重建。我们后来分两步做：先换一条不容易挂死的通道，再把要传的东西变小。

第一步，产物改走 OSS。Runner 上传，ECS 用预签名 URL 拉。压缩用 `gzip -1`，墙钟优先，别在 Runner 上为了多压几兆再烧 CPU。SSH 传大文件这条先停掉。

第二步，上传走传输加速域名。Runner 一侧用 accelerate endpoint；签名和 ECS 拉取仍用地域 endpoint。全局那个 endpoint Secret 别改成加速域名——加速只适合上传这一跳，不适合当所有 API 的默认入口。

第三步，默认不再传完整镜像。`docker save` 常常两百兆以上；构建上下文打成包可以到几十兆。Actions 只产出上下文，ECS 上再 `docker build`。体积下来，时间也下来。

第四步，构建时换国内包源。镜像里若有 `apk add`，继续打官方源，ECS 上还能再卡十分钟以上。换成云厂商镜像源，别把刚省下的时间吐回去。

现在默认是上下文 + 加速上传 + ECS 上构建。完整镜像留作应急，工作流里手动切回去就行。

## 改完大概快多少

我们看过一段连续成功部署里「上传/中转」这一步，三代路径大概是这样：

| 路径 | 样本 | Transfer 中位 | Transfer 长尾 |
|------|------|------------|-------------|
| 公网 SSH 整镜像 | 十多次 | ~6 分钟 | 1～2.5 小时，偶发挂死 |
| 完整镜像 + OSS | 很少几次 | 十余分钟 | 仍可能二十分钟级 |
| 上下文 + 加速 | 切换后的跑次 | ~1 分钟 | 同量级；ECS build 再一两分钟 |

最差的 SSH 案例里，Transfer 从约两小时掉到约一分钟。相对 SSH 中位也是数倍起，撞上长尾时差距更大。整条 Job 从「经常被传输拖成几十分钟」收到大约数分钟——编译本身还是要占一部分。

完整镜像走 OSS 的样本不多，别当严谨对比。对我来说结论就一句：通道先稳，字节再砍；两步都做完，长尾才像样。

## 几个容易踩的坑

中转桶要开传输加速。全局 endpoint 别顺手改成加速域名。

默认不再上传完整镜像 artifact 之后，别的环境若还想复用这次产物，要么自己构建，要么那一次切回完整镜像模式再跑。瘦身上下文和旧的全量运行时也不要混——缺二进制往往到构建或启动才爆。

再往后，可以把 Runner 放到离 ECS 更近的地方，或者直接推国内镜像仓库。静态资源要不要也走加速，另说。Transfer 耗时最好接着记，免得哪次临时改回整包，长尾又回来。
