# 项目改进实施方案

> 基于全面审计结果的系统性改进计划
> 
> 生成时间: 2026-04-03
> 预计完成时间: 4-6 周

---

## 执行摘要

本方案基于对整个项目的全面审计，识别出 **5 个严重安全漏洞**、**多个性能瓶颈**、**测试覆盖率不足（仅 5%）** 等关键问题。改进方案分为 4 个阶段，共 11 个具体任务，预计 4-6 周完成。

### 关键指标

| 指标 | 当前状态 | 目标 | 改进幅度 |
|------|---------|------|---------|
| 安全漏洞 | 5 个严重 | 0 | 100% |
| 测试覆盖率 | ~5% | 60%+ | 12倍 |
| 构建内存 | 12GB | 8GB | -33% |
| 平均组件大小 | 300+ 行 | <200 行 | -33% |
| API 响应时间 | 未监控 | <100ms | 新增监控 |

---

## 第一阶段：安全加固（立即执行，1-2 天）

**优先级**: 🔴 严重

### 1.1 轮换敏感凭证并从 Git 历史删除

#### 问题描述
- `.env` 文件被提交到版本控制
- 包含数据库密码 `Mvb5uPA3eQCa`、Algolia Admin Key 等
- 任何有 Git 访问权限的人都可以获取

#### 实施步骤

```bash
# 1. 安装 git-filter-repo
brew install git-filter-repo

# 2. 备份仓库
cp -r /Users/zhouhua/Documents/GitHub/blog /Users/zhouhua/Documents/GitHub/blog-backup

# 3. 从 Git 历史中删除 .env
cd /Users/zhouhua/Documents/GitHub/blog
git filter-repo --path .env --invert-paths --force

# 4. 更新 .gitignore
cat >> .gitignore << 'GITIGNORE'

# Environment variables
.env
.env.local
.env.*.local
.env.production
GITIGNORE

# 5. 创建 .env.example
cat > .env.example << 'ENVEXAMPLE'
# Database Configuration
POSTGRES_URL=postgresql://user:password@host:5432/database
POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/database?pgbouncer=true
POSTGRES_URL_NO_SSL=postgresql://user:password@host:5432/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/database
POSTGRES_USER=your_user
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database

# Algolia Configuration
GATSBY_ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_KEY=your_admin_key

# Sentry Configuration
PUBLIC_SENTRY_DSN=your_sentry_dsn

# API Authentication
API_KEY=your_secure_api_key_here
ENVEXAMPLE

# 6. 轮换凭证（在 Vercel 和 Algolia 控制台）
# - 重置 Postgres 密码
# - 重新生成 Algolia Admin Key
# - 生成新的 API_KEY

# 7. 强制推送（警告：会重写历史）
git push origin --force --all
git push origin --force --tags
```

#### 验证清单
- [ ] .env 文件已从 Git 历史中删除
- [ ] .env 已添加到 .gitignore
- [ ] .env.example 已创建
- [ ] 所有敏感凭证已轮换
- [ ] Vercel 环境变量已更新

---

### 1.2 为 API 端点添加认证和输入验证

#### 问题描述
- API 端点完全开放，无认证
- 缺少输入验证和长度限制
- 无速率限制，易受 DoS 攻击

#### 实施步骤

**创建文件 `src/pages/api/_middleware.ts`**:

```typescript
import type { APIContext } from 'astro';

export function validateAuth(context: APIContext): void {
  const apiKey = import.meta.env.API_KEY;
  const authHeader = context.request.headers.get('Authorization');
  
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    throw new Response(
      JSON.stringify({ code: 1, message: 'Unauthorized' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export function validateContentType(context: APIContext): void {
  const contentType = context.request.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) {
    throw new Response(
      JSON.stringify({ code: 1, message: 'Content-Type must be application/json' }),
      { 
        status: 415,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
```

**创建文件 `src/pages/api/_schemas.ts`**:

```typescript
import { z } from 'zod';

export const createLinkSchema = z.object({
  value: z.string()
    .url('必须是有效的 URL')
    .max(2048, 'URL 长度不能超过 2048 字符')
    .trim()
});

export const deleteLinkSchema = z.object({
  key: z.string()
    .min(1, 'key 不能为空')
    .max(20, 'key 长度不能超过 20 字符')
    .regex(/^[a-zA-Z0-9]+$/, 'key 只能包含字母和数字')
});
```

**重构 `src/pages/api/link.ts`** - 添加认证、验证和完整错误处理（详见附录 A）

#### 验证清单
- [ ] 认证中间件已创建
- [ ] 输入验证 Schema 已定义
- [ ] link.ts 已重构
- [ ] 使用 Postman 测试 API

---

### 1.3 修复 XSS 漏洞

#### 问题描述
- `JournalList.tsx` 使用 `dangerouslySetInnerHTML`
- `gradient/_index.tsx` 使用 `innerHTML`

#### 实施步骤

```bash
# 1. 安装 DOMPurify
pnpm add dompurify
pnpm add -D @types/dompurify
```

**修改 `src/react/components/JournalList.tsx`**:

```typescript
import DOMPurify from 'dompurify';

// 第 86 行替换为：
<div 
  className="prose prose-sm max-w-none"
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(item.html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'class']
    })
  }}
/>
```

**修改 `src/pages/projects/gradient/_index.tsx`** - 使用 DOM API 替代 innerHTML（详见附录 B）

#### 验证清单
- [ ] DOMPurify 已安装
- [ ] JournalList.tsx 已修复
- [ ] gradient/_index.tsx 已修复
- [ ] 使用浏览器开发工具测试 XSS 防护

---

### 1.4 改进错误处理和日志记录

#### 问题描述
- API 路由中存在空的 catch 块
- 无结构化日志记录

#### 实施步骤

**创建文件 `src/lib/logger.ts`**:

```typescript
type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      context: this.context,
      message,
      ...data
    };

    if (import.meta.env.PROD) {
      console[level](JSON.stringify(logData));
    } else {
      console[level](
        `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`,
        message,
        data || ''
      );
    }
  }

  info(message: string, data?: LogContext) {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogContext) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: LogContext) {
    this.log('error', message, {
      ...data,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });
  }
}

export const apiLogger = new Logger('API');
export const dbLogger = new Logger('Database');
```

**清理调试代码**:
- `src/pages/projects/blurry/_index.tsx` (3 处 console.error)
- `src/lib/algolia.ts` (2 处 console.error)
- `src/pages/projects/es-toolkit-benchmark/_SizeTab.tsx` (3 处 console.log)

#### 验证清单
- [ ] Logger 工具已创建
- [ ] 所有 API 路由使用 Logger
- [ ] 调试代码已清理

---

## 第二阶段：性能优化（1-2 周）

**优先级**: 🟠 高

### 2.1 拆分超大组件

#### 问题描述
- `blurry/_index.tsx` (760 行) 包含所有逻辑
- 多个 useEffect 依赖链，频繁重新渲染

#### 实施步骤

```bash
# 创建目录结构
mkdir -p src/pages/projects/blurry/{components,hooks,types}
```

**提取类型定义** (`src/pages/projects/blurry/types/index.ts`):

```typescript
export interface BlurryFormValues {
  type: 'type1' | 'type2';
  interlace: boolean;
  blur: number;
  brightness: number;
  contrast: number;
}

export interface CanvasRendererProps {
  formValues: BlurryFormValues;
  width: number;
  height: number;
}
```

**提取组件**:
1. `components/CanvasRenderer.tsx` - Canvas 渲染逻辑
2. `components/FormPanel.tsx` - 表单 UI
3. `components/ExportHandler.tsx` - 导出功能

**重构主组件** - 组合子组件，减少到 <150 行

**对其他大型组件重复此过程**:
- `animate-blurry/_index.tsx` (448 行)
- `pattern/_index.tsx` (402 行)
- `gradient/_index.tsx` (382 行)

#### 验证清单
- [ ] blurry 组件已拆分
- [ ] 组件使用 React.memo 优化
- [ ] 功能正常，无回归
- [ ] 其他大型组件已拆分

---

### 2.2 修复 React 性能反模式

#### 问题描述
- `ProjectList.tsx` 存在 O(n²) 复杂度
- `useRecentList.ts` 有无意义的 useEffect

#### 实施步骤

**优化 `src/react/components/ProjectList.tsx`**:

```typescript
import { useMemo, memo } from 'react';

export function ProjectList({ projects }: ProjectListProps) {
  // 优化：从 O(n²) 到 O(n)
  const grouped = useMemo(() => {
    const visible = projects.filter(p => !p.hidden);
    const groupMap = new Map<string, typeof projects>();
    
    visible.forEach(project => {
      const group = project.group || 'other';
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group)!.push(project);
    });
    
    return GROUP_ORDER
      .map(group => ({
        group,
        items: groupMap.get(group) || []
      }))
      .filter(g => g.items.length > 0);
  }, [projects]);
  
  return (
    <div className="space-y-8">
      {grouped.map(({ group, items }) => (
        <ProjectGroup key={group} group={group} items={items} />
      ))}
    </div>
  );
}

const ProjectGroup = memo(({ group, items }: ProjectGroupProps) => {
  // 组件实现
});

const ProjectCard = memo(({ project }: ProjectCardProps) => {
  // 组件实现
});
```

**修复 `src/react/hooks/useRecentList.ts`** - 修正 useEffect 依赖

**为搜索结果添加 memo** (`src/react/components/Search/Result.tsx`)

#### 验证清单
- [ ] ProjectList 已优化为 O(n)
- [ ] useRecentList 依赖已修复
- [ ] 搜索结果使用 memo
- [ ] React DevTools Profiler 显示改进

---

### 2.3 优化构建配置

#### 问题描述
- 构建需要 12GB 内存
- Bundle 大小未优化

#### 实施步骤

```bash
# 安装分析工具
pnpm add -D rollup-plugin-visualizer
```

**修改 `astro.config.mjs`** - 添加 bundle 分析和代码分割:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'vendor-heavy': ['html2canvas', 'xlsx', 'mermaid'],
            'vendor-search': ['algoliasearch', 'react-instantsearch'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    }
  }
});
```

**动态导入重型库**:

```typescript
// 优化前：
import html2canvas from 'html2canvas';

// 优化后：
const handleExport = async () => {
  const html2canvas = (await import('html2canvas')).default;
  // 使用 html2canvas
};
```

**减少构建内存** - 修改 `package.json`:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS=--max-old-space-size=4096 astro dev",
    "build": "NODE_OPTIONS=--max-old-space-size=6144 astro check && NODE_OPTIONS=--max-old-space-size=8192 astro build"
  }
}
```

#### 验证清单
- [ ] Bundle 分析工具已配置
- [ ] 代码分割已实施
- [ ] 重型库已动态导入
- [ ] 构建内存降低到 8GB
- [ ] Bundle 大小减少 20%+

---

## 第三阶段：测试覆盖（2-3 周）

**优先级**: 🟡 中

### 3.1 为 API 路由添加测试

#### 问题描述
- API 路由完全无测试
- 复杂的重试逻辑、日期比较未验证

#### 实施步骤

**创建文件 `src/pages/api/link.test.ts`**:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, DELETE } from './link';

vi.mock('./_db', () => ({
  default: {
    selectFrom: vi.fn(),
    insertInto: vi.fn(),
    updateTable: vi.fn(),
    deleteFrom: vi.fn(),
  }
}));

describe('Link API', () => {
  describe('POST /api/link', () => {
    it('应该创建新链接', async () => {
      const request = new Request('http://localhost/api/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: JSON.stringify({ value: 'https://example.com' })
      });
      
      const response = await POST({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.code).toBe(0);
      expect(data.key).toBeDefined();
    });
    
    it('应该拒绝无效的 URL', async () => {
      // 测试实现
    });
    
    it('应该拒绝未认证的请求', async () => {
      // 测试实现
    });
    
    it('应该处理哈希冲突', async () => {
      // 测试重试逻辑
    });
    
    it('应该重用 3 个月未使用的键', async () => {
      // 测试过期重用逻辑
    });
  });
});
```

**测试覆盖目标**:
- `src/pages/api/link.ts` - 完整覆盖
- `src/pages/api/links.ts` - 基础覆盖
- `src/pages/api/_utils.ts` - base62 边界条件

#### 验证清单
- [ ] API 路由测试已创建
- [ ] 测试覆盖关键逻辑
- [ ] 所有测试通过
- [ ] 覆盖率 >80%

---

### 3.2 为核心工具函数添加测试

#### 问题描述
- `utils.ts`、`algolia.ts` 等核心工具无测试
- `html.ts` 缺少部分函数测试

#### 实施步骤

**创建文件 `src/lib/utils.test.ts`**:

```typescript
import { describe, it, expect } from 'vitest';
import { cn, formatDate, readingTime, dateRange } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('应该合并 Tailwind 类名', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
    
    it('应该处理条件类名', () => {
      expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });
  });
  
  describe('formatDate', () => {
    it('应该格式化日期为中文', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'zh')).toBe('2024年1月15日');
    });
  });
  
  describe('readingTime', () => {
    it('应该计算阅读时间', () => {
      const text = '这是一段测试文本。'.repeat(100);
      const time = readingTime(text);
      expect(time).toBeGreaterThan(0);
    });
  });
});
```

**补全 `src/lib/html.test.ts`** - 添加缺失的测试:
- `getReadInfo()` - CJK 字符计数
- `getImage()` - 异步缓存
- `getExcerpt()` - HTML 提取

#### 验证清单
- [ ] utils.ts 测试已创建
- [ ] html.ts 测试已补全
- [ ] 所有测试通过
- [ ] 覆盖率 >70%

---

## 第四阶段：架构改进（持续）

**优先级**: 🔵 低

### 4.1 依赖审计和清理

#### 问题描述
- 107 个生产依赖，可能存在未使用的包
- 依赖版本可能存在安全漏洞

#### 实施步骤

```bash
# 1. 运行安全审计
pnpm audit

# 2. 分析未使用的依赖
pnpm add -D depcheck
npx depcheck

# 3. 更新过期依赖
pnpm outdated
pnpm update

# 4. 审查重型依赖
# 考虑轻量级替代方案：
# - xlsx → exceljs (更小)
# - moment → dayjs (已使用)
# - lodash → es-toolkit (已使用)
```

**依赖优化建议**:
- 移除未使用的 `@radix-ui` 组件
- 考虑按需导入 `react-icons`
- 评估是否需要 `html2canvas`（可用 Canvas API 替代）

#### 验证清单
- [ ] 安全漏洞已修复
- [ ] 未使用依赖已移除
- [ ] 依赖数量减少 10%+
- [ ] 无功能回归

---

### 4.2 建立持续监控机制

#### 问题描述
- 无性能监控
- 无错误追踪
- 无构建时间趋势

#### 实施步骤

**1. 配置 Vercel Analytics**:

```typescript
// src/layouts/PageLayout.astro
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

<Analytics />
<SpeedInsights />
```

**2. 配置 Sentry 性能监控**:

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% 采样
  profilesSampleRate: 0.1,
});
```

**3. 添加构建时间监控** - 创建 GitHub Action:

```yaml
# .github/workflows/build-metrics.yml
name: Build Metrics

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and measure
        run: |
          time pnpm build
          du -sh dist/
```

**4. 设置依赖更新自动化**:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

#### 验证清单
- [ ] Vercel Analytics 已启用
- [ ] Sentry 性能监控已配置
- [ ] 构建指标已记录
- [ ] Dependabot 已配置

---

## 实施时间表

| 阶段 | 任务 | 预计时间 | 负责人 | 状态 |
|------|------|---------|--------|------|
| **第一阶段** | 安全加固 | 1-2 天 | - | 待开始 |
| 1.1 | 轮换凭证 | 2 小时 | - | 待开始 |
| 1.2 | API 认证 | 4 小时 | - | 待开始 |
| 1.3 | 修复 XSS | 2 小时 | - | 待开始 |
| 1.4 | 错误处理 | 2 小时 | - | 待开始 |
| **第二阶段** | 性能优化 | 1-2 周 | - | 待开始 |
| 2.1 | 拆分组件 | 5 天 | - | 待开始 |
| 2.2 | React 优化 | 3 天 | - | 待开始 |
| 2.3 | 构建优化 | 2 天 | - | 待开始 |
| **第三阶段** | 测试覆盖 | 2-3 周 | - | 待开始 |
| 3.1 | API 测试 | 1 周 | - | 待开始 |
| 3.2 | 工具测试 | 1 周 | - | 待开始 |
| **第四阶段** | 架构改进 | 持续 | - | 待开始 |
| 4.1 | 依赖审计 | 2 天 | - | 待开始 |
| 4.2 | 监控机制 | 1 天 | - | 待开始 |

---

## 成功指标

### 安全指标
- ✅ 0 个严重安全漏洞
- ✅ 所有 API 端点需要认证
- ✅ 所有用户输入经过验证
- ✅ XSS 防护测试通过

### 性能指标
- ✅ 构建内存 ≤ 8GB
- ✅ Bundle 大小减少 20%
- ✅ 平均组件大小 < 200 行
- ✅ 首屏加载时间 < 2s

### 质量指标
- ✅ 测试覆盖率 ≥ 60%
- ✅ 所有 API 路由有测试
- ✅ 核心工具函数有测试
- ✅ 0 个 ESLint 错误

### 架构指标
- ✅ 依赖数量减少 10%
- ✅ 0 个已知安全漏洞
- ✅ 性能监控已启用
- ✅ 错误追踪已配置

---

## 附录

### 附录 A: 完整的 link.ts 重构代码

详见单独文件: `docs/appendix-a-link-api.md`

### 附录 B: gradient/_index.tsx XSS 修复

详见单独文件: `docs/appendix-b-xss-fix.md`

### 附录 C: 测试示例

详见单独文件: `docs/appendix-c-test-examples.md`

---

## 联系和支持

如有问题或需要澄清，请联系项目维护者。

**文档版本**: 1.0  
**最后更新**: 2026-04-03
