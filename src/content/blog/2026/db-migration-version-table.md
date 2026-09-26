---
title: 版本表 + 顺序脚本的数据库迁移
tags:
  - 数据库
  - 迁移
  - DevOps
category: 技术
hero: ./db-migration-hero.jpg
heroCopyright: Photo on <a href="https://unsplash.com/photos/iar-afB0QQw?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-05-10 23:06:02
---

说到数据库迁移，很多人会说：不就是按顺序执行 SQL 吗。是的，不过关系库上演进 schema 时，真正难的是另一头——代码与迁移脚本随时间线性增长，各环境库的物理状态却可能分叉：手工改过、跑到一半失败过、从备份恢复过。迁移系统要在「脚本集合」和「这台库现在什么样」之间建立可验证、可重复的对应关系，而不只是「再执行一遍 SQL」。

## 顺序文件 + 版本表在管什么

一类常见实现和 Flyway、Liquibase 的抽象一致：

1. 每次变更固化为有序单元（通常一文件一版本号，如 `V001__add_user_email.sql`）。
2. 目标库维护版本表，记录已应用标识（及可选 checksum、执行时间、执行人）。
3. 运行时按序扫描：标识不在表中则执行，成功后再写入版本表。

```text
migrations/
  V001__init.sql
  V002__add_orders.sql
  V003__orders_status_index.sql

库内：schema_version / flyway_schema_history / …
  version | success | checksum | applied_at
```

差异多在：是否独立进程、是否校验 checksum、是否内建 repair / baseline。自研轻量方案通常零额外服务，只依赖数据库客户端。

### 版本表是权威——直到它撒谎

| 状态 | 含义 |
|------|------|
| 未应用 | 表中无该标识 |
| 已应用 | 表中有该标识 |
| 不一致 | 表说已应用，库对象却缺或多余；或文件改过但 checksum 对不上 |

要约定：正常路径以版本表为准且与结构一致；异常路径用 `information_schema` / `SHOW` / `\d` 观测后，修脚本或人工纠偏，再对齐版本表。不要假装「永远一致」。

工程上还会碰到第三种声音：「以实际库结构为准，版本表只是缓存」。轻量方案我更倾向：**运行时听版本表；出事时用元数据当验尸报告**，改的是脚本或手工补丁，而不是每次启动都 diff 全库。

## 线性版本，历史不可改写

已在共享环境跑过的文件，不要改语义。同名不同义会让「空库 + 全量」和「旧库 + 增量」走成两个世界。纠错用新版本；若必须替换（比如刚合并进主干、尚无生产），团队流程要一致——谁有权改、改完要不要重算 checksum、已跑环境怎么 repair。

目标是理想条件下两条路径收敛：空库从 V001 应用到最新；旧库只跑版本表里缺失的后缀。收敛失败时，优先怀疑「有人改过旧文件」或「有人绕过迁移器改过库」，而不是先怪工具。

## 幂等优先于「恰好一次」

顺序迁移器假设每版本最多成功一次。现实常见：执行到一半失败、人工已建过列、恢复缺索引。若 DDL 只能「处女执行」，重跑就是事故。目标状态已部分达成时，仍应可安全重试：

```sql
-- 示意：MySQL 上用元数据守卫
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- CREATE INDEX：索引不存在才建
-- DROP：对象存在才丢
-- 数据回填：用 WHERE 收窄，避免重复破坏
UPDATE users
SET email_normalized = LOWER(email)
WHERE email IS NOT NULL
  AND (email_normalized IS NULL OR email_normalized <> LOWER(email));
```

其他库有各自条件 DDL（PostgreSQL 的 `IF NOT EXISTS`、可查询的 catalog）。原则相同：**守卫目标态，而不是假设自己是第一个碰这张表的人**。

半失败时版本表怎么写，要事先定。同一事务里「DDL + 写版本」最干净，但 MySQL DDL 常隐式提交；那时只能「成功才插入版本行」，失败留未应用，靠幂等重跑。不要出现「版本行写了、对象没建齐」却无人知道。

## 结构与数据的边界

| | 管什么 | 注意 |
|--|--------|------|
| 结构迁移 | 表、索引、约束、类型 | 锁、在线 DDL、重建成本 |
| 数据迁移 | 回填、枚举映射、拆合表 | 批量、可中断、回滚语义 |

同版本内尽量先结构、后数据、再收紧约束（视锁与数据量调整），避免半结构状态卡业务。大表变更要单独跑道：在线 DDL、分批、双写、expand-contract。框架应允许长事务 / 可中断，别假设每条脚本都是毫秒级。

对我来说，把「改类型」和「回填五千万行」塞进同一个版本号，是最常见的把自己逼进发布窗口的方式。

## 执行入口只留一处

「扫描目录 → 执行 → 写版本表」只实现一处。应用启动、灌种子、CI job、紧急 hotfix 脚本，都调用它。多处复制同一段逻辑，规则一定会漂：有人忘了 checksum，有人跳过锁，有人在事务外写版本行。

种子数据（fixture）和 schema 迁移最好分开目录、分开命令，避免测试数据版本号污染生产历史。

## 版本表最小字段可以长什么样

自研时不必一上来抄 Flyway 全字段，但至少要能回答「跑过没有、何时、是否成功」：

```sql
CREATE TABLE schema_version (
  version      VARCHAR(64)  NOT NULL PRIMARY KEY,
  description  VARCHAR(255) NULL,
  checksum     VARCHAR(64)  NULL,
  script_name  VARCHAR(255) NOT NULL,
  applied_at   DATETIME(3)  NOT NULL,
  success      TINYINT(1)   NOT NULL DEFAULT 1,
  execution_ms INT          NULL
);
```

编排伪代码：

```text
lock(migration)                    -- 防多实例并发
for each file in sorted(migrations):
  if version in schema_version and success: continue
  if version in schema_version and not success: abort or retry per policy
  begin / run script (幂等)
  insert schema_version(... success=1)
unlock
```

多实例同时启迁最容易写出双跑。没有全局锁（advisory lock / `GET_LOCK` / 专用锁表）时，先保证「只有发布 job 跑迁移」，应用进程只读不迁。

## 自研轻量 vs Flyway / Liquibase

| | 自研顺序脚本 + 版本表 | Flyway / Liquibase |
|--|----------------------|---------------------|
| 依赖 | 数据库客户端即可 | 多一个组件 / 插件 |
| 适用 | 团队中小、环境可控、DDL + 中小数据修正 | 环境多、要审计与门禁 |
| Checksum | 可自己做，常省略 | 标配 validate |
| Baseline / repair | 靠约定和手工 | 有标准命令与语义 |
| 多分支合并 | 靠版本号纪律 | 仍要纪律；工具只帮发现冲突 |
| CI 集成 | 自己包一层 | 现成、文档多 |

轻量适合：不想多伺候一个组件、迁移以 DDL 为主、出了事人能登上库。专用工具 ROI 上升的信号：强审计（谁、何时、哪套环境、哪条脚本）；checksum + `validate` 进 CI；标准 baseline / repair、多库多 schema；和容器化发布流水线深度绑死。

原则：**工具解决流程与治理，不替代幂等和清晰版本策略。** 脚本本身不幂等，换工具也只是失败得更正式。

Liquibase 更偏「变更集 + 多种格式」；Flyway 更偏「版本化 SQL 文件」。选谁不如先问：团队是不是已经用 SQL 思考 schema。已经是「一文件一版本」心智，飞到 Flyway 成本最低；需要复杂 precondition / context，再看 Liquibase。两者都解决不了「大表怎么在线改」——那是变更设计问题。

## 环境分叉时怎么收

常见分叉来源：有人在预发手工加了列；生产跑到 V010 失败，版本行没写，对象写了一半；从昨日备份恢复，版本表比代码旧。处理顺序对我来说是：

1. 用元数据看清**实际**缺什么、多什么
2. 决定补迁移文件还是一次性 repair SQL（进入受控流程）
3. 再决定是否插入 / 删除 / 修正版本行
4. 在空库上重放全量，确认还能收敛

不要只改版本表假装对齐。版本表撒谎之后，下一个环境会复制谎言。

## 落地时我会先问的

1. 已发布脚本能不能改？不能的话纠错流程是什么？
2. 半失败重跑会不会炸？守卫写了没？
3. 版本表和真实结构冲突时听谁的？谁有权改版本行？
4. 大表变更有没有单独跑道？
5. 迁移入口是不是只有一个？CI 和生产是否同一套二进制 / 同一份脚本目录？
6. 多实例部署时谁拿锁？应用启动会不会并发迁？

对这些问题没有统一答案时，先别急着引入更重的工具——先把约定写进团队规范，再让脚本和版本表执行约定。约定清楚了，自研和 Flyway 只是实现细节；约定不清楚，两者都会在凌晨三点变成同一场事故。
