---
title: 审计日志：异步、脱敏、按敏感度记账
tags:
  - 安全
  - 后端
  - 审计
category: 技术
hero: ./audit-log-hero.jpg
heroCopyright: Photo on <a href="https://unsplash.com/photos/hpjSkU2UYSU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-05-06 21:59:54
---

说到审计，很多人会说：不就是记一行日志吗。是的，不过权限控制回答的是「能不能做」，回答不了「做过什么」。有人投诉数据被改了，却说不清是谁；出了异常，不知道哪次后台操作踩中了；合规来要处理记录，系统里没有。我们后来补了一套操作审计：能追人、追对象、追前后差异，同时尽量不拖主业务。

这篇文章写的是我们在业务后台里落地的那一套——从原则、表结构、索引取舍，到 diff 怎么生成、前端怎么看、踩过哪些坑、能力边界在哪。不是「企业级审计白皮书」，是一份能对着代码核对的实现笔记。

## 合规不是选择题，安全侧更像黑匣子

如果你的系统会碰用户数据，审计往往不是「要不要做」，而是「什么时候做」。法规文本我不会复述全文，只记对我们有约束力的方向：

- GDPR 一类要求能证明处理活动合法，并在主体请求时拿出处理记录。
- 国内《数据安全法》要求全流程数据安全管理制度与相应技术措施。
- 等保 2.0 要求对重要用户行为、重要安全事件做审计，记录里通常要有时间、类型、主体、客体、结果。

这些不是纸上谈兵。不过合规只是入口——真正逼我们动手的，往往是事故现场。

想象几个场景。某天大量用户数据被批量导出：是谁、何时、导出了哪些字段？没有审计，只能猜。运营误删配置，系统异常：不知道删的是哪一条、能不能按变更点回滚，只能整库备份一锤子。离职账号仍在用：他访问过什么、改过什么？权限控制拦不住「已经发生的事」。

审计像黑匣子。它不能阻止事件发生，但能让你在事后更快定位和响应。

业务侧也能用：用户投诉「账号被盗用」时，日志是举证材料；分析管理员操作路径，能看见流程卡在哪；基于 before 数据做精确回滚，比「恢复到昨晚备份」细一个数量级。对我来说，业务价值是副产品——先把「谁对什么做了什么」记清楚，别的才站得住。

## 不能拖慢主路径

审计是辅助能力。绝不能因为记日志，把删除、审批、支付卡住。我们的默认解法是：主流程改完库就返回，日志异步写。

```go
func DeleteUser(ctx context.Context, userID int64) error {
  if err := db.Delete(&User{ID: userID}).Error; err != nil {
    return err
  }

  go func() {
    _ = auditService.CreateAuditLog(context.Background(), &AuditLog{
      OperationType: "DELETE",
      TargetType:    "User",
      TargetID:      userID,
      // ...
    })
  }()

  return nil
}
```

即使审计写入失败，也不回滚已经成功的业务操作。这是一个明确的权衡：宁可丢少量审计，也不让主业务受影响。

### 别把请求的 ctx 传进 goroutine

这里有个坑，我们踩过。用 `go func()` 异步写时，如果把请求的 `ctx` 传进去，主请求一返回，上层中间件常会 cancel 这个 context，异步 goroutine 还没写完就被掐断。表现是：业务成功了，审计表偶尔缺行，查起来像「幽灵操作」。

```go
// 不推荐：请求结束时 ctx 可能已被取消
go func() {
  _ = auditService.CreateAuditLog(ctx, log)
}()

// 推荐：独立生命周期；需要超时就用 WithTimeout
go func() {
  _ = auditService.CreateAuditLog(context.Background(), log)
}()
```

用 `context.Background()`（或带超时的独立 context），让审计写入不受请求生命周期绑定。对「绝对不能丢」的场景，异步 goroutine 不够——那是消息队列和本地 outbox 的活，后面再谈。

## 日志本身也要脱敏

审计库若进了明文密码，访问审计的人就等于拿到敏感面。想象一下：权限收紧了业务表，却把密码明文写进了 `data_after`——审计系统自己变成了洞。

规则示例：

| 类型 | 规则 | 示例 |
|------|------|------|
| 密码 | 整段抹掉 | `[REDACTED]` |
| 手机号 | 留前 3 后 4 | `138****5678` |
| 证件号 | 留前 3 后 4 | `110***********1234` |
| 银行卡 | 留前 4 后 4 | `6222****1234` |

```go
func MaskPhone(phone string) string {
  if len(phone) < 7 {
    return strings.Repeat("*", len(phone))
  }
  return phone[:3] + strings.Repeat("*", len(phone)-7) + phone[len(phone)-4:]
}
```

入库脱敏一遍；前端做 diff 展示时再扫一遍敏感字段。别假设上游永远完美——某次重构漏了字段映射，前端二次脱敏至少挡住展示层。

## 分级，别每条都存全文

不是所有操作都值得记完整 before / after。我们把操作分成两类：

**SENSITIVE（记完整前后数据或 diff）**

- 删除：用户、订单、关键业务对象
- 权限变更：角色提升、权限修改
- 状态变更：账号启停、审核通过 / 拒绝
- 财务或权益：积分调整、会员等级变更

**REGULAR（只记基本信息）**

- 查询
- 普通字段更新（不涉及权限、资金、状态机关键节点）

好处很具体：普通操作不塞大块 JSON，存储和列表查询都轻一截；人眼扫日志时也更容易盯住关键变更。对我来说，分级不是「省钱技巧」，是承认审计有成本——记全量会逼你迟早 truncation，不如一开始就按敏感度记账。

## 集中存还是各服务各记

微服务下两条路：

| | 分布式（每服务一张表） | 集中式（统一入口） |
|--|------------------------|-------------------|
| 写入 | 服务独立，互不影响 | 依赖统一服务可用性 |
| 查询 | 「某人一周做了什么」要聚合 | 一处筛，真能用 |
| 运维 | 多套表结构、多套归档 | 单点要高可用 |

审计的核心价值在查询和分析。如果日志散在各个服务，「某个管理员过去一周做了哪些操作」会变成跨服务拼图。我们选了集中存储：所有审计进统一服务的 `audit_logs`；其他服务异步 HTTP 写入；后台只查一处。

代价是入口可用性。换来的是真能用。架构上大致是：

```text
业务服务 A / B / C
        │  异步 HTTP（或以后 MQ）
        ▼
   统一审计服务（user-service 一类承载）
        │
        ▼
   audit_logs 表
        ▲
        │  查询 API
   管理后台 / 合规导出
```

关键点就三条：统一落库、跨服务异步写、前端只打查询接口。后面吞吐量顶不住时，把 HTTP 换成消息队列，查询模型不用推倒重来。

## 契约先定：Thrift 里长什么样

我们走 Thrift-First：先定接口，再生成前后端代码。用意不是「更时髦」，是变更时编译器逼你改全。实体大致如下（字段名可按团队习惯调整）：

```thrift
namespace go audit
namespace js audit

struct AuditLog {
  1: required i64 id
  2: required i64 adminId
  3: required string adminUsername
  4: required string operationType  // CREATE/UPDATE/DELETE/APPROVE/REJECT
  5: required string targetType     // AdminUser/User/Order/Product …
  6: required i64 targetId
  7: optional string dataBefore     // 操作前（JSON）
  8: optional string dataAfter      // 操作后（JSON）
  9: required string sensitivityLevel  // SENSITIVE/REGULAR
  10: optional string ipAddress
  11: optional string userAgent
  12: required i64 createdAt
}

service AuditService {
  CreateAuditLogResponse createAuditLog(1: CreateAuditLogRequest req)
  QueryAuditLogsResponse queryAuditLogs(1: QueryAuditLogsRequest req)
}
```

生成后前端拿到 TypeScript 类型和 API Client，后端拿到 Model / Handler 骨架。`targetType` 用字符串而不是枚举死锁所有业务对象——新对象接入时不必立刻改 IDL，代价是拼写要靠约定和单测兜。

## 表与索引：查询模式比「联合索引看起来更强」重要

审计日志的查询场景很明确，索引按场景来，不按教科书「越宽越好」：

```sql
CREATE TABLE `audit_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `admin_id` BIGINT NOT NULL,
  `admin_username` VARCHAR(128) NOT NULL,
  `operation_type` VARCHAR(128) NOT NULL,
  `target_type` VARCHAR(128) NOT NULL,
  `target_id` BIGINT NOT NULL,
  `data_before` TEXT,
  `data_after` TEXT,
  `sensitivity_level` VARCHAR(32) NOT NULL,
  `ip_address` VARCHAR(64),
  `user_agent` VARCHAR(512),
  `created_at` DATETIME(3) NOT NULL,

  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_operation_type` (`operation_type`),
  INDEX `idx_target` (`target_type`, `target_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 索引 | 场景 | 例子 |
|------|------|------|
| `idx_admin_id` | 某人的全部操作 | 「张三过去一周做了什么？」 |
| `idx_operation_type` | 某类操作 | 「最近有哪些 DELETE？」 |
| `idx_target` | 某对象变更史 | 「用户 123 被谁改过？」 |
| `idx_created_at` | 时间范围 | 「上个月的审计」 |

你可能会问：为什么不建 `(admin_id, created_at)`？因为实际筛选很杂——有时只按人，有时只按时间，有时人 + 操作类型，有时对象。联合索引只有最左前缀能稳稳用上；「只按 `created_at`」会落空。我们选多单列（外加对象联合），让优化器自己组合。慢查询再调，比先拍脑袋一个大联合稳。

### 列表别把 TEXT 拖出来

`data_before` / `data_after` 是 TEXT，常见实现里存在行外。列表页每次 `SELECT *`，等于每行多一轮 I/O，翻页越翻越慢。

```go
// 列表：不加载大字段
func QueryAuditLogs(req *QueryRequest) ([]*AuditLog, error) {
  var logs []*AuditLog
  err := db.Select(
    "id, admin_id, admin_username, operation_type, target_type, target_id, sensitivity_level, created_at",
  ).
    Where("created_at >= ?", req.StartTime).
    Find(&logs).Error
  return logs, err
}

// 详情：再取全文
func GetAuditLogDetail(id int64) (*AuditLog, error) {
  var log AuditLog
  err := db.First(&log, id).Error
  return &log, err
}
```

对我来说这是审计表的基本卫生，不是优化彩蛋。列表只要「谁、对什么、何时、什么操作」；diff 留给详情页。

## Diff 怎么生成

敏感更新时，需要可对比的前后数据。看起来是比两个 JSON，细节不少：字段新增、删除、嵌套、时间精度、数值类型从 int 漂成 float……我们先把 before / after 转成 map，再逐字段比，只把变化写进 diff。

```go
func (s *AuditService) GenerateDataDiff(before, after interface{}) (string, error) {
  beforeMap, _ := toMap(before)
  afterMap, _ := toMap(after)

  allKeys := make(map[string]bool)
  for k := range beforeMap {
    allKeys[k] = true
  }
  for k := range afterMap {
    allKeys[k] = true
  }

  diff := make(map[string]interface{})
  for key := range allKeys {
    beforeVal, beforeExists := beforeMap[key]
    afterVal, afterExists := afterMap[key]

    if beforeExists && !afterExists {
      diff[key] = map[string]interface{}{"before": beforeVal, "after": nil}
      continue
    }
    if !beforeExists && afterExists {
      diff[key] = map[string]interface{}{"before": nil, "after": afterVal}
      continue
    }
    if beforeExists && afterExists && !isEqual(beforeVal, afterVal) {
      diff[key] = map[string]interface{}{"before": beforeVal, "after": afterVal}
    }
  }

  b, err := json.Marshal(diff)
  return string(b), err
}
```

生成示例：

```json
{
  "role": {
    "before": "ADMIN",
    "after": "SUPER_ADMIN"
  },
  "status": {
    "before": 0,
    "after": 1
  },
  "updated_at": {
    "before": "2024-05-01T10:00:00Z",
    "after": "2024-05-06T15:30:00Z"
  }
}
```

只记变了的字段，省空间，也省人眼。未变字段不写——否则审计详情页会变成「整张表快照对比」，谁也看不下去。

`isEqual` 要自己约定：时间是否截到秒、`null` 和缺省键是否等同、嵌套对象比深拷贝还是只比一层。我们踩过「每次更新都因为 `updated_at` 进 diff」——要么忽略一批噪音字段，要么入库前剥掉自动维护列。

## 前端：可读性才是审计价值

如果只是一堆 JSON，审计人员很难快速理解发生了什么。我们用左右对比组件（例如 `react-diff-viewer-continued`）渲染脱敏后的文本：

```tsx
import ReactDiffViewer from 'react-diff-viewer-continued';

function DataDiffComponent({ dataBefore, dataAfter }: Props) {
  const before = JSON.parse(dataBefore || '{}');
  const after = JSON.parse(dataAfter || '{}');

  const maskedBefore = maskSensitiveFields(before);
  const maskedAfter = maskSensitiveFields(after);

  const beforeText = JSON.stringify(maskedBefore, null, 2);
  const afterText = JSON.stringify(maskedAfter, null, 2);

  return (
    <ReactDiffViewer
      oldValue={beforeText}
      newValue={afterText}
      splitView={true}
      showDiffOnly={false}
      useDarkTheme={false}
    />
  );
}
```

效果类似：

```text
  "id": 123,
  "username": "zhangsan",
- "role": "ADMIN",
+ "role": "SUPER_ADMIN",
- "status": 0,
+ "status": 1,
  "email": "zhangsan@example.com"
```

红是改前 / 删除，绿是改后 / 新增。`showDiffOnly` 可按页面需要打开——字段特别多时只看变更行更省事。人眼扫整包 JSON 效率太差；只看变更字段，才像审计工具，而不是数据库导出页。

## 能力边界写清楚，比吹强

已经有的：

- 敏感操作自动记（DELETE / 关键 UPDATE 等）
- 数据对比可视化
- 敏感字段脱敏（入库 + 展示）
- 筛选查询（人 / 类型 / 对象 / 时间）
- 异步写入不堵主路径
- 跨服务写入统一表

当时还缺的：

- 表会无限涨，清理靠人工
- 没有实时告警，只能事后查
- 不支持导出 CSV / PDF
- 高并发下 HTTP 写入可能成为瓶颈

对我来说，把边界写进文档比写「企业级完备」有用。下一任接手的人至少知道哪些坑是已知的。

## 往后可以叠什么——按痛感排序

### 热温冷，别等表炸了再想

审计日志随时间线性涨，查询迟早变慢。分层比「DELETE 三个月以前」粗暴一点、也好一点：

- 热（约 3 个月内）：主表，快查
- 温（约 3–12 个月）：历史表，可查但慢一点可接受
- 冷（1 年以上）：对象存储，按需下载

```sql
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);

DELETE FROM audit_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

归档脚本要可定期跑，也要可干跑核对行数。合规留存年限先问清楚，再定冷数据删不删。

### 规则告警：从事后查到「尽量当场知道」

| 类型 | 触发条件示例 | 处理建议 |
|------|--------------|----------|
| 批量删除 | 5 分钟内删除超过 N 条 | 即时告警 |
| 权限提升 | 普通管理员 → 超管 | 邮件 + 即时告警 |
| 异常时段 | 凌晨 2–6 点敏感操作 | 即时告警 |
| 异常 IP | 非白名单来源 | 记日志，定期汇总 |

规则告警解决不了复杂模式，但能盖住最贵的几种事故。行为基线、风险评分那一类，等规则告警跑稳再叠——一上来上 ML，容易什么都做不完。

### 导出是合规的刚需

CSV 给 Excel；JSON 给程序；PDF 给要「交文件」的审计方。导出接口要带和列表相同的筛选条件，并二次脱敏——别把详情里挡掉的字段从导出通道漏出去。

```ts
async function exportAuditLogs(filters: QueryFilters) {
  const response = await api.audit.exportAuditLogs({
    ...filters,
    format: 'csv', // csv | json | pdf
  });
  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${Date.now()}.csv`;
  a.click();
}
```

### HTTP 顶不住时再上消息队列

当前跨服务 HTTP 写入，在突发高并发下可能成为瓶颈。Kafka 一类能换吞吐、解耦存储细节，也支持重放修数据。不过队列不是免费的：至少要约定至少一次投递下的幂等（例如业务侧 `request_id` 去重），以及消费者积压时的告警。主路径仍然不该同步等队列 ACK——那又把延迟买回来了。

### 基于 before 的精确回滚

能看历史之后，下一步有人会问：能不能一键改回去？可以做，但要和权限、二次确认、回滚本身的审计绑紧。

```ts
async function rollbackOperation(auditLogId: number) {
  const log = await api.audit.getAuditLog(auditLogId);
  switch (log.operationType) {
    case 'DELETE':
      await api[log.targetType].create(JSON.parse(log.dataBefore));
      break;
    case 'UPDATE':
      await api[log.targetType].update(
        log.targetId,
        JSON.parse(log.dataBefore),
      );
      break;
  }
}
```

示意而已。真实系统还要处理：对象已不存在、外键断了、枚举值已下线、回滚是否再次触发审计（应该触发）。别做成「详情页一个按钮点下去就改生产」。

## 落地时我会先问的

1. 主路径失败了业务还算不算成功？审计丢失的上限能不能接受？  
2. 请求 `ctx` 有没有漏进异步 goroutine？  
3. 密码、证件、银行卡有没有入库前脱敏？前端 diff 有没有二次扫？  
4. SENSITIVE / REGULAR 的边界谁定、谁改？  
5. 列表查询有没有把 TEXT 选出来？  
6. 索引是否对着真实筛选，而不是对着「看起来很强的联合索引」？  
7. 表涨到什么规模开始归档？合规留存几年？  
8. 跨服务写入挂了有没有降级和积压可见性？  

对这些问题没有统一答案时，先别追求「一条不丢 + AI 检测」。先把可追溯做实：异步可靠性、脱敏、分级、查询模型、可读性。告警和归档是叠上去的；一上来全做，容易什么都做不完。

审计系统不是「记一行日志」那么简单。它是一套在主业务旁边平行运转的记账系统——记错了、记慢了、记明文了，都会在事故那天反过来咬你。
