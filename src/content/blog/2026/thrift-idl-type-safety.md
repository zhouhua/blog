---
title: 用 Thrift IDL 拉齐前后端类型
tags:
  - Thrift
  - TypeScript
  - Go
category: 技术
hero: ./thrift-idl-hero.jpg
heroCopyright: Photo on <a href="https://unsplash.com/photos/Im7lZjxeLhg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
type: post
date: 2026-04-20 11:32:27
---

说到前后端接口契约，很多人会说：这不就是 swagger 写清楚、两边对齐字段吗。是的，不过真正拖垮联调的，往往不是「有没有文档」，而是**同一形状在三处被手写了三遍**——后端 Go struct、前端 TypeScript interface、文档注解或 wiki。字段必填性、命名、枚举稍一漂，问题就堆到联调。我们后来把契约收到 Thrift IDL，再靠生成把类型、客户端、路由和 OpenAPI 拉到同一条链上。

对我来说，这套东西解决的不是「IDL 比 JSON Schema 更高尚」，而是把变更入口收成一个：改契约只改一处，编译器和 CI 帮你扫影响面。

## 旧办法卡在哪

契约不一致最常见。同一字段，一边 `i64`，一边写成 `string`；一边 required，一边当 optional 传。接口一改，要动多处手工代码，还经常有人只改了自己那一侧。

文档滞后是第二层。手写注解容易漏；文档更新慢半拍时，前端按文档写，线上按代码跑。你以为对齐了，其实对齐的是上周的记忆。

效率上，前端手写调用封装，后端手挂路由和绑定，重复劳动多，还容易漏注册。类型安全缺失时，很多错误要到运行时才爆；重构时影响面全靠人肉搜。

看起来「各写各的更灵活」。翻过来想——灵活的是重复劳动，不是变更速度。

| 痛点 | 表现 | 真正成本 |
|------|------|----------|
| 契约漂移 | 字段类型 / 必填性不一致 | 联调返工、线上隐性 Bug |
| 文档滞后 | 注解漏写、wiki 过期 | 前端按错形状开发 |
| 手工封装 | client、路由、绑定各写一遍 | 漏注册、路径写错 |
| 无编译期约束 | 错误拖到运行时 | 重构不敢动、影响面靠猜 |

## 核心理念：一层契约，三份产物

我们的解法很直：以 Thrift IDL 为唯一契约源，脚本生成前端类型与 API 客户端、后端路由骨架、OpenAPI 文档。

- **单一契约源**：接口形状只在 Thrift 里改。
- **生成优先**：类型 / client、路由骨架、OpenAPI 从 IDL 生成，少手写。
- **编译期对齐**：前后端共享同一套语义，类型错误尽量在构建期暴露。
- **文档即产物**：描述写在注解里，文档跟实现一起出。

文件按领域拆：通用 `Result`、分页、时间戳放 common；业务按域分文件。Go / JS namespace 各声明一份即可。业务名在文里一律换成通用例子。

```text
packages/thrift/src/main/thrift/
├── common.thrift          # Result、PageRequest、枚举
├── common_go.thrift       # Go 侧通用类型包装
├── user.thrift            # 用户域
├── catalog.thrift         # 目录 / 资源域
├── payment.thrift         # 支付域
├── auth.thrift            # 认证域
└── ...
```

架构上可以记成一条流水线：

```text
Thrift IDL（唯一真相）
    │
    ├─► TS 类型 + API client（前端包）
    ├─► Go 路由 Register + request struct（服务骨架）
    └─► OpenAPI 3 JSON → 文档站（Scalar 等）
```

生成管「形状和挂载」；业务 Handler 仍是手写。这层边界要划清，否则团队会期待「生成出完整业务」，反而失望。

## IDL 里怎么描述 HTTP

Thrift 本身不讲 HTTP。我们用自定义注解补全路径、方法和参数落点：

```thrift
namespace go user

include "common_go.thrift"

struct User {
  1: required i64 id (api.description="用户 ID，唯一标识符")
  2: required string phone (api.description="手机号")
  3: required string nickname (api.description="昵称")
  4: optional string avatar (api.description="头像 URL")
  5: required common_go.UserRole role (api.description="用户角色")
  6: required common_go.UserStatus status (api.description="用户状态")
  7: required common_go.Timestamp createTime (api.description="创建时间")
  8: optional common_go.Timestamp updateTime (api.description="更新时间")
}

struct GetUserRequest {
  1: required i64 id (api.path="id", api.description="用户 ID")
}

struct UpdateUserRequest {
  1: required i64 id (api.path="id", api.description="用户 ID")
  2: required string nickname (api.body="nickname", api.description="昵称")
  3: optional string avatar (api.body="avatar", api.description="头像 URL")
}

service UserService {
  common_go.Result getById(1: GetUserRequest request) (
    api.get="/user/:id"
    api.summary="获取用户信息"
    api.description="根据用户 ID 查询用户详细信息"
  )

  common_go.Result updateUser(1: UpdateUserRequest request) (
    api.put="/user/:id"
    api.summary="更新用户信息"
    api.description="修改用户的昵称、头像等信息"
  )
}
```

注解大致这样用：

| 注解 | 作用域 | 含义 | 示例 |
|------|--------|------|------|
| `api.description` | 字段 / 方法 | 说明，进文档 | `api.description="用户 ID"` |
| `api.path` | 字段 | 路径参数 | `api.path="id"` → `/user/:id` |
| `api.query` | 字段 | 查询串 | `api.query="keyword"` → `?keyword=` |
| `api.body` | 字段 | JSON body | `api.body="nickname"` → `{"nickname":"..."}` |
| `api.get` / `post` / `put` / `delete` | 方法 | HTTP 方法 + 路径 | `api.post="/user/create"` |
| `api.summary` | 方法 | 短标题 | `api.summary="创建用户"` |

约定写清之后，解析器才能稳定吐出前端 client 和后端路由。注解漏了 `api.path`，路径参数就不会进生成物——这是契约层的问题，不要到 Handler 里「临时补绑」。

有人会问：为什么不直接用 OpenAPI 当唯一源？可以。我们当时选 Thrift，是因为后端已经在用 Thrift 生态做结构体生成，HTTP 注解只是扩展；前端再吃同一份解析结果。对你团队来说，选哪种 IDL 不如选「一处维护 + 生成进 CI」这件事本身。

## 前端：类型 + client

脚本解析 service / struct / enum 和 `api.*`，生成两样东西：TypeScript interface（optional 对应 `?`），以及按 service 的工厂函数，内部调统一 `HttpClient`。

生成脚本的骨架大概是这样（示意，不是完整解析器）：

```ts
// packages/thrift/scripts/generate-api-client.ts
import fs from 'fs';
import path from 'path';

interface ServiceMethod {
  name: string;
  returnType: string;
  requestType: string;
  http?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    pathParams: string[];
  };
}

function parseThriftService(filePath: string): ParsedService[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  // 解析 service、struct、enum
  // 提取 api.* 注解：method/path、pathParams、query、body
  // 缺 HTTP 注解的方法应在这里直接失败，不要静默跳过
  return [];
}

function generateApiClient(service: ParsedService): string {
  return `
export function create${service.name}(client: HttpClient) {
  return {
    ${service.methods
      .map(
        (method) => `
    ${method.name}: (request: ${method.requestType}) =>
      client.${method.http!.method.toLowerCase()}<${method.returnType}>(
        '${method.http!.path}',
        request
      )`,
      )
      .join(',\n')}
  };
}
`;
}
```

生成出来的类型与客户端：

```ts
// packages/thrift/src/generated/user.ts
export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createTime: string;
  updateTime?: string;
}

export interface GetUserRequest {
  id: number;
}

export interface UpdateUserRequest {
  id: number;
  nickname: string;
  avatar?: string;
}
```

```ts
// packages/thrift/src/generated/services/user.ts
import type { HttpClient } from '@example/api-client';
import type { Result, GetUserRequest, UpdateUserRequest } from '../user';

export function createUserService(client: HttpClient) {
  return {
    getById: (request: GetUserRequest) =>
      client.get<Result>('/user/:id', request),
    updateUser: (request: UpdateUserRequest) =>
      client.put<Result>('/user/:id', request),
  };
}
```

业务侧只组装 client，不再手抄路径：

```ts
import { createApiClient } from '@example/api-client';
import { createUserService } from '@example/thrift/services/user';

const apiClient = createApiClient({ baseURL: '/api' });
const userService = createUserService(apiClient);

async function loadUser(userId: number) {
  const result = await userService.getById({ id: userId });
  if (result.code === 0 && result.data) {
    // TypeScript 推断 result.data 为 User（视 Result 泛型约定而定）
    console.log(result.data.nickname);
  }
}

await userService.updateUser({
  id: 123,
  nickname: '新昵称',
  // avatar: 123,  // 编译错误：类型不匹配
});
```

路径参数怎么从 request 填进 URL，由 `HttpClient` 按约定处理，须与生成器一致。有人喜欢在生成物里直接拼 URL；我们当时倾向「生成路径模板 + client 统一替换」，少在生成模板里堆字符串逻辑。

这一步真正省掉的，是「每个接口再写一遍 path + 方法 + 请求类型」。编译器能拦住的，就别留到联调。

## 后端：路由骨架 + Handler

我们用 Hertz。生成器输出 `Register`：按注解挂 `GET/PUT`、中间件槽位，真正业务写在 Handler。

```ts
// packages/thrift/scripts/generate-go-routes.ts（示意）
function generateGoRouter(service: ParsedService): string {
  return `
package ${service.name.toLowerCase()}

import (
  "github.com/cloudwego/hertz/pkg/app/server"
)

func Register(r *server.Hertz) {
  root := r.Group("/", rootMw()...)
  {
    ${generateRouteGroups(service.methods)}
  }
}
`;
}
```

生成的路由大致如下：

```go
// go-services/user-service/router_gen.go
package main

import (
  "github.com/cloudwego/hertz/pkg/app/server"
  user "example.com/platform/user-service/biz/handler/user"
)

func GeneratedRegister(r *server.Hertz) {
  root := r.Group("/", rootMw()...)
  {
    _user := root.Group("/user", _userMw()...)
    _user.GET("/:id", append(_getbyidMw(), user.GetById)...)
    _user.PUT("/:id", append(_updateuserMw(), user.UpdateUser)...)
  }
}
```

Handler 里 `BindAndValidate` 绑到生成出的 request struct，再调 service：

```go
func GetById(ctx context.Context, c *app.RequestContext) {
  var req user.GetUserRequest
  if err := c.BindAndValidate(&req); err != nil {
    c.JSON(400, user.Result{Code: 400, Message: err.Error()})
    return
  }

  userData, err := service.GetUserById(ctx, req.Id)
  if err != nil {
    c.JSON(500, user.Result{Code: 500, Message: err.Error()})
    return
  }

  c.JSON(200, user.Result{Code: 0, Data: userData})
}
```

生成管「挂哪条路径、参数怎么进结构体」；业务逻辑仍是手写。Hertz 这边对我们有用的点很具体：中间件按路由分组挂、和生成出的 Go struct 能直接绑、`BindAndValidate` 少一层手工解析。性能对比标准库那一套，我没有在这篇里做压测结论——选型当时是团队栈与生态，不是「一定更快」。

## OpenAPI：从 IDL 推文档，而不是反过来手写

另有脚本把 Thrift 类型映射到 OpenAPI 3。核心是类型表 + 递归处理 list / 引用 / 枚举，再把 path / query / body 从注解拆进 parameters 与 requestBody。

```js
// scripts/generate-openapi.js
const typeMapping = {
  i8: { type: 'integer', format: 'int32' },
  i32: { type: 'integer', format: 'int32' },
  i64: { type: 'integer', format: 'int64' },
  string: { type: 'string' },
  bool: { type: 'boolean' },
  double: { type: 'number', format: 'double' },
  Timestamp: { type: 'string', format: 'date-time' },
};

function convertThriftTypeToOpenAPI(thriftType, structs, enums) {
  if (typeMapping[thriftType]) {
    return typeMapping[thriftType];
  }
  if (thriftType.startsWith('list<')) {
    const innerType = thriftType.match(/list<(.+)>/)[1];
    return {
      type: 'array',
      items: convertThriftTypeToOpenAPI(innerType, structs, enums),
    };
  }
  // map<K,V> 可按同样方式递归；键一般落成 string
  if (structs[thriftType]) {
    return { $ref: `#/components/schemas/${thriftType}` };
  }
  if (enums[thriftType]) {
    return { type: 'string', enum: enums[thriftType].values };
  }
}

function generateOpenAPISpec(thriftFiles) {
  const spec = {
    openapi: '3.0.0',
    info: { title: 'Platform API', version: '1.0.0' },
    paths: {},
    components: { schemas: {} },
  };

  for (const file of thriftFiles) {
    const { structs, enums, services } = parseThriftFile(file);

    for (const [name, struct] of Object.entries(structs)) {
      spec.components.schemas[name] = {
        type: 'object',
        properties: {},
        required: [],
      };
      for (const field of struct.fields) {
        spec.components.schemas[name].properties[field.name] = {
          ...convertThriftTypeToOpenAPI(field.type, structs, enums),
          description: field.description,
        };
        if (field.required) {
          spec.components.schemas[name].required.push(field.name);
        }
      }
    }

    for (const service of Object.values(services)) {
      for (const method of service.methods) {
        const { httpMethod, path } = parseApiAnnotation(method);
        if (!spec.paths[path]) spec.paths[path] = {};
        spec.paths[path][httpMethod.toLowerCase()] = {
          summary: method.summary,
          description: method.description,
          parameters: extractParameters(method.request, structs),
          requestBody: extractRequestBody(method.request, structs),
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Result' },
                },
              },
            },
          },
        };
      }
    }
  }

  return spec;
}
```

`extractParameters` 只收带 `api.path` / `api.query` 的字段；`extractRequestBody` 只收 `api.body`。同一 request struct 里 path 和 body 混用是常态——`UpdateUserRequest` 就是。

生成的文档片段示意（含 GET / PUT 与 schema）：

```json
{
  "openapi": "3.0.0",
  "info": { "title": "Platform API", "version": "1.0.0" },
  "paths": {
    "/user/{id}": {
      "get": {
        "summary": "获取用户信息",
        "description": "根据用户 ID 查询用户详细信息",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer", "format": "int64" },
            "description": "用户 ID"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Result" }
              }
            }
          }
        }
      },
      "put": {
        "summary": "更新用户信息",
        "description": "修改用户的昵称、头像等信息",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer", "format": "int64" }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "nickname": { "type": "string", "description": "昵称" },
                  "avatar": { "type": "string", "description": "头像 URL" }
                },
                "required": ["nickname"]
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "format": "int64", "description": "用户 ID" },
          "phone": { "type": "string", "description": "手机号" },
          "nickname": { "type": "string", "description": "昵称" },
          "avatar": { "type": "string", "description": "头像 URL" },
          "role": { "$ref": "#/components/schemas/UserRole" },
          "status": { "$ref": "#/components/schemas/UserStatus" },
          "createTime": { "type": "string", "format": "date-time" }
        },
        "required": ["id", "phone", "nickname", "role", "status", "createTime"]
      }
    }
  }
}
```

文档站由网关静态托管 `openapi.json` + 壳页面。我们用 Scalar 渲染。相对传统 Swagger UI，当时体感是加载更轻、交互更顺；这不是客观评测结论，只是选型记录。静态路径务必 `filepath.Clean`，拒绝 `..` 和绝对路径：

```go
func main() {
  h := server.Default(
    server.WithHostPorts(fmt.Sprintf(":%d", cfg.Server.Port)),
  )

  h.GET("/docs/*filepath", func(ctx context.Context, c *app.RequestContext) {
    requestPath := c.Param("filepath")
    if requestPath == "" || requestPath == "/" {
      requestPath = "index.html"
    } else if strings.HasPrefix(requestPath, "/") {
      requestPath = requestPath[1:]
    }

    cleanPath := filepath.Clean(requestPath)
    if strings.Contains(cleanPath, "..") || filepath.IsAbs(cleanPath) {
      c.JSON(403, map[string]any{"code": 403, "message": "forbidden"})
      return
    }

    c.File(filepath.Join("docs", cleanPath))
  })

  h.Spin()
}
```

壳页面可以极薄：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Platform API</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="./openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
```

文档「永不过期」这话只在一种前提下成立：生成物进 CI，而且有人改 IDL 忘交文件时流水线会红。没有这一步，文档站照样会漂。

## 数据流：从改 IDL 到两边能调

从接口定义到前后端调用，完整链路可以记成：

```text
开发者改 user.thrift
        │
        ▼
thrift:generate
  ├─ TS types / client
  └─ Go router_gen + model
        │
        ▼
generate:openapi → openapi.json
        │
        ├─ 前端：装 client，业务页调用
        └─ 后端：补 Handler，BindAndValidate
        │
        ▼
提交（生成物进库）→ CI 再生成并 diff
```

日常命令大致是：

```bash
# 1. 改契约
vim packages/thrift/src/main/thrift/user.thrift

# 2. 生成代码与文档
pnpm run thrift:generate
pnpm run generate:openapi

# 3. 前端用新类型；后端补 Handler
# 4. 提交时把生成物一起带上
```

契约先行之后，前后端可以并行：IDL 合入，一边写页面一边写 Handler。沟通从「这个字段到底是什么类型」收成「IDL 里那一行」。

## CI：生成物不同步就红

CI 里再跑一遍生成，然后检查工作区是否干净：

```yaml
# .github/workflows/ci.yml（示意）
name: CI
on: [push, pull_request]

jobs:
  verify-thrift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Generate code from Thrift
        run: pnpm run thrift:generate

      - name: Generate OpenAPI
        run: pnpm run generate:openapi

      - name: Check for uncommitted changes
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "Generated code is out of sync!"
            git diff
            exit 1
          fi
```

有人改了 IDL 却忘交生成文件，流水线直接红。Git hook 里预生成也可以，和 CI 双保险。对我来说 CI 是权威：本地 hook 可以帮人省事，但不能替代远端校验——有人关 hook，没人关 CI。

## 设计上几条约束

- 命名说人话；字段和接口尽量都有 `api.description`。
- 通用类型进 common，业务按域拆文件。
- 破坏性变更优先新 struct / 新方法，而不是偷偷改旧字段语义。
- 新增字段尽量 `optional`；废弃用注解标出来。
- 生成可以做增量，但「与 IDL 一致」必须以 CI 为准。

向后兼容不是口号。新增字段用 optional，旧客户端还能跑；重大变更加 v2 方法，而不是把旧方法的 body 形状偷换成另一套。看起来慢半拍，实际上少一次全站联调事故。

## 体感上省什么

维护点从「前端类型 + 后端结构 + 文档」收成 IDL 一处。我们当时统计过一段时间（标签是团队内部对照，不是行业基准）：

| 指标 | 传统方式 | Thrift IDL 驱动 | 备注 |
|------|----------|-----------------|------|
| 接口定义维护点 | 3 处（前端、后端、文档） | 1 处（IDL） | 减少约 67% |
| 类型不一致类联调问题 | 每月约 5–8 个 | 基本为 0 | 我们当时观察到 |
| 新接口「改契约 + 挂通」耗时 | 约 30–45 分钟 | 约 10–15 分钟 | 不含业务实现深度 |
| 文档相对代码的延迟 | 约 1–3 天 | 跟生成物一起 | 实时同步 |

数字别神话——团队熟练度和领域复杂度会变。拆开看，收益大致落在四层：

1. **编译期**：参数类型、必填字段、枚举值，能在 TS / Go 侧先拦一截；改 IDL 后不兼容的调用点会成片报错，重构影响面可见。
2. **手写面**：client、路由注册、OpenAPI 注解不再各写一遍；迭代速度取决于「改 IDL + 生成 + 补 Handler」，不是「三处同步」。
3. **文档**：描述跟着注解走；Scalar 提供在线试调，前端少猜字段。
4. **协作**：契约合入后可以并行；沟通对象从口头约定收成文件 diff。

对我来说硬收益是：改契约时编译器帮你扫影响面，文档不再靠自觉。

## 坑与边界

**注解约定一漂，生成就漂。** `api.path` / `api.body` 写错不会在解析阶段尖叫得很响时，错误会晚到联调。把校验写进生成器：缺 HTTP 注解的 service 方法直接失败。

**`Result` 泛型在 TS 侧要约定清楚。** Thrift 里若统一 `common_go.Result`，生成端要决定 `data` 怎么收窄到具体 struct；收不好，前端又退回 `any`。

**i64 与 JS number。** 大整数进前端会丢精度。当时我们约定：对外 ID 能用 string 就用 string，或在 client 层对大整数字段做字符串化。别假设「生成完就万事大吉」。

**生成物要不要进库。** 我们进库了，为了 review 能看见 diff、离线可构建。代价是 PR 变吵。另一种做法是 CI 生成、产物不提交——团队要选一边，并写进规范。

**文档站安全。** 静态文件服务是常见入口；路径穿越、把内部草稿 openapi 暴露到公网，都会变成运维问题。内网文档与公网文档要分清。

代价是生成链路要养：注解约定、解析边界情况、CI。接口还在涨、前后端多人并行时，这套比继续靠 wiki 同步划算。接口极少、两人面对面改，硬上整套生成反而重。

下一步如果你也在纠结多处手写类型，先别急着选框架——先问：你们有没有一处权威契约，以及有没有人敢在 CI 里因为生成物不同步而让流水线红掉。

可对照阅读：[Apache Thrift](https://thrift.apache.org/)、[Hertz](https://www.cloudwego.io/docs/hertz/)、[OpenAPI Specification](https://spec.openapis.org/oas/latest.html)。
