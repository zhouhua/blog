---
title: es-toolkit：更现代的 JS 工具库
tags:
  - javascript
  - typescript
  - 工具库
category: 技术
hero: ./es-toolkit.jpg
type: post
featured: true
date: 2026-03-20 10:00:00
---

**TL;DR：** 如果你在现代前端项目里还在用 lodash，这篇文章会带你认识一个更适合 2020s 的选择：**es-toolkit**——一个专为 ES2017+ 设计、对 TypeScript 友好的工具库，单个函数体积往往只有 lodash 的几十分之一，性能普遍快 2–3 倍，并且提供了对 lodash 几乎 100% 行为兼容的迁移路径。

这篇文章主要面向已经在生产环境使用 lodash 的前端 / Node.js 开发者，以及正在做性能优化、包体积优化或者 TypeScript 类型治理的人。如果你只是偶尔在小脚本里用用 lodash，迁不迁都问题不大；但如果你的项目是一个长期维护的中大型应用，工具库的选择会在接下来几年里持续影响你的构建时间、运行性能和类型体验。

如果你在前端项目里引入过 lodash，那你一定见过类似这样的写法：

```typescript
// 早期写法：整包引入，体积大，tree shaking 无效
import _ from 'lodash';
const result = _.groupBy(users, 'department');

// 改进写法：按需引入，但路径写法不统一，且仍携带大量内部依赖
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';

// 或使用 ESM 版本，支持 tree shaking，但单函数体积依然可观
import { groupBy, uniqBy } from 'lodash-es';
```

即便用了 `lodash-es` 加 tree shaking，导入一个 `groupBy` 仍然会带来数 KB 的代码——因为 lodash 内部有大量为 ES5 环境准备的 polyfill 和兼容代码。

lodash 作为 JavaScript 工具库的事实标准，陪伴了我们很多年。但它诞生于 ES6 之前的年代，很多设计决策已经显得过时。今天要介绍的 [es-toolkit](https://github.com/toss/es-toolkit)，是一个面向现代 JavaScript 的替代方案，由韩国金融科技公司 Toss 开源，目前在 GitHub 上已有超过 10,000 个 star。

## es-toolkit 是什么

es-toolkit 的自我介绍很直接：**比 lodash 快 2-3 倍，体积最多小 97%**。这不是夸张的营销话术，而是有实测数据支撑的结论。

它覆盖了日常开发中最常用的工具函数，按功能分为几个模块：

- **Array**：`chunk`、`uniq`、`difference`、`groupBy`、`intersection` 等数组操作
- **Object**：`pick`、`omit`、`merge`、`mapValues` 等对象操作
- **Function**：`debounce`、`throttle`、`memoize`、`once` 等函数控制
- **Math**：`sum`、`mean`、`round`、`clamp` 等数值计算
- **String**：`camelCase`、`snakeCase`、`trim` 等字符串处理
- **Predicate**：`isNil`、`isNotNil`、`isString` 等类型判断
- **Promise**：`delay`、`timeout` 等异步工具

## 为什么比 lodash 更快、更小

### 体积：最多减少 97%

lodash 的代码写于 ES5 时代，为了实现各种功能，内部有大量的 polyfill 和兼容性代码。即便使用 `lodash-es` 并开启 tree shaking，导入单个函数仍然会携带不少冗余代码。

es-toolkit 则完全基于现代 JavaScript 特性（ES2017+）构建，不需要任何 polyfill，实现逻辑极其精简。以 `chunk` 函数为例，es-toolkit 的实现只有不到 100 字节。

这个差距在实际项目中是非常显著的——如果你的包体积对用户的加载性能有影响，es-toolkit 能帮你省掉一大块。

### 性能：利用现代 JS API

es-toolkit 性能提升的核心原因，是直接使用了现代 JavaScript 内置 API，而不是自己实现一套老式算法。

以下是官方的性能对比数据（MacBook Pro M1 Max，单位：次/秒）：

| 函数 | es-toolkit | lodash-es | 差距 |
|------|-----------|-----------|------|
| `omit` | 4,767,360 | 403,624 | **11.8×** |
| `pick` | 9,121,839 | 2,663,072 | **3.43×** |
| `difference` | 10,436,101 | 5,155,631 | **2.02×** |
| `intersection` | 9,999,571 | 4,630,316 | **2.15×** |
| `differenceWith` | 9,291,897 | 4,275,222 | **2.17×** |
| `intersectionWith` | 8,074,722 | 3,814,479 | **2.12×** |
| `unionBy` | 6,435,983 | 3,794,899 | **1.69×** |

`omit` 能快出将近 12 倍，原因很简单：lodash 的 `omit` 用了大量内部工具函数层层调用，而 es-toolkit 直接用解构和 `Object.fromEntries` 几行就搞定了。

## 我们自己来验证一下

官方数据是在特定机器上测量的，不同硬件和浏览器环境下结果会有差异。下面这个 demo 直接在你的浏览器里实时运行对比测试，同时也展示了各函数的 bundle size 差距（数据来自 es-toolkit 官方文档，使用 esbuild 测量）：

<iframe
  sandbox="allow-scripts allow-same-origin allow-presentation"
  src="/projects/es-toolkit-benchmark?embed"
  frameborder="0"
  style="border-radius:8px;height:600px;width:100%;max-width:880px;"
></iframe>

这个 demo 的性能测试逻辑完全跑在一个独立的 Web Worker 里，避免阻塞页面主线程。核心思路是：为常见的 20+ 个函数准备相同规模的测试数据，然后在 worker 中用 `performance.now()` 分别测量 es-toolkit 和 lodash-es 各执行 10,000 次的总耗时，最后把结果通过 `postMessage` 逐条流式回传给页面：

```typescript
const testCases = [
  { es: () => chunk(arr, 5), lodash: () => lChunk(arr, 5), name: 'chunk' },
  { es: () => uniq(arrWithDups), lodash: () => lUniq(arrWithDups), name: 'uniq' },
  { es: () => groupBy(items, x => String(x.id)), lodash: () => lGroupBy(items, x => String(x.id)), name: 'groupBy' },
  // ...
];

const callPerIter = 10_000;

for (const c of testCases) {
  const s1 = performance.now();
  for (let j = 0; j < callPerIter; j++) c.es();
  const esTotal = performance.now() - s1;

  const s2 = performance.now();
  for (let j = 0; j < callPerIter; j++) c.lodash();
  const lodashTotal = performance.now() - s2;

  ctx.postMessage({
    type: 'result',
    payload: {
      name: c.name,
      esToolkitMs: esTotal,
      lodashMs: lodashTotal,
      ratio: lodashTotal / esTotal,
    },
  });
}
```

由于所有测试都在同一个 worker 里顺序执行、使用同一份数据，因此环境噪音相对可控。不同机器、不同浏览器下绝对数值会有差异，但你在本地看到的倍数差距，通常会和官方基准测试的量级比较接近。

打包体积的对比则是通过浏览器里的 `esbuild-wasm` 动态测出来的。我们先枚举出需要测试的函数，以及它们在 es-toolkit 和 lodash-es 中各自对应的模块地址，类似：

```typescript
export const bundleSizeCases = [
  {
    category: 'Array',
    fn: 'chunk',
    esToolkitModule: 'https://esm.sh/es-toolkit@1.45.1/es2022/dist/array/chunk.mjs',
    esToolkitSymbol: 'chunk',
    lodashModule: 'lodash-es/chunk',
    lodashIsDefault: true,
  },
  // ...
];
```

接着会为每个 case 生成一段只包含「导入函数 + `console.log` 一下」的最小入口代码，分别交给 `esbuild-wasm` 打包，然后用 `Blob` 和 `pako.gzip` 计算出未压缩和 gzip 后的体积：

```typescript
const result = await esbuild.build({
  bundle: true,
  format: 'esm',
  minify: true,
  treeShaking: true,
  plugins: [createHttpPlugin()], // 通过 esm.sh 在浏览器中按需拉取依赖
  stdin: {
    contents: code, // 例如：import { chunk as fn } from '...'; console.log(fn);
    loader: 'js',
  },
  write: false,
});

const output = result.outputFiles?.[0]?.text ?? '';
const raw = new Blob([output]).size;
const gzipped = gzip(output).byteLength;
```

这样，页面上展示的每条「体积对比」其实都是在你当前浏览器环境里、基于固定版本（es-toolkit@1.45.1 / lodash-es@4.17.23）实时算出来的。
## 原生 TypeScript 支持

### lodash 的类型问题

lodash 的 TypeScript 类型定义来自社区维护的 `@types/lodash`，不随 lodash 本体同步发布，积累了不少问题。

**`_.get` 路径不安全**：路径是普通字符串，返回值一律是 `any`，类型信息完全丢失：

```typescript
import _ from 'lodash';

const user = { name: 'Alice', age: 30 };
const name = _.get(user, 'name');  // 类型：any
const oops = _.get(user, 'typo'); // 不报错，运行时返回 undefined
```

**`_.omit` / `_.pick` 返回类型不精确**：`_.pick` 的返回类型是 `Pick<T, K>`，但 `_.omit` 在很多版本里直接返回 `Partial<T>`，丢失了具体键的信息：

```typescript
import _ from 'lodash';

const obj = { a: 1, b: 2, c: 3 };
const result = _.omit(obj, 'a');
// 类型：Partial<{ a: number; b: number; c: number }>
// 而不是 { b: number; c: number }——b 和 c 莫名其妙变成了可选
result.b?.toFixed(); // 要加 ?. 才不报错
```

**`_.groupBy` 键类型丢失**：返回类型是 `_.Dictionary<T[]>`，也就是 `{ [index: string]: T[] }`，键的具体取值信息丢失，无法在类型层面区分不同分组：

```typescript
import _ from 'lodash';

const users = [
  { name: 'Alice', role: 'admin' as const },
  { name: 'Bob', role: 'user' as const },
];

const byRole = _.groupBy(users, 'role');
// 类型：_.Dictionary<{ name: string; role: 'admin' | 'user' }[]>
// 访问 byRole.admin 是合法的，访问 byRole.anything 也是合法的——没有约束
```

**函数重载选择错误**：`@types/lodash` 里很多函数有多个重载，有时 TypeScript 会选中不符合预期的那个，导致推断结果出乎意料，且错误提示难以理解。

### es-toolkit 的改善

es-toolkit 是用 TypeScript 原生编写的，类型定义精确且完整。举个例子，`groupBy` 的返回值类型能被正确推断：

```typescript
import { groupBy } from 'es-toolkit';

const users = [
  { name: 'Alice', department: 'engineering' },
  { name: 'Bob', department: 'design' },
  { name: 'Charlie', department: 'engineering' },
];

const byDept = groupBy(users, u => u.department);
// 类型为 Record<string, typeof users>
// byDept.engineering → 正确推断为数组类型
```

此外，es-toolkit 还提供了一些实用的类型守卫，比如 `isNotNil`，在过滤数组时非常有用：

```typescript
import { isNotNil } from 'es-toolkit';

const values = [1, null, 2, undefined, 3];
const filtered = values.filter(isNotNil);
// 类型为 number[]，而不是 (number | null | undefined)[]
```

## 如何从 lodash 迁移

### 直接替换（推荐）

对于大多数常用函数，直接把导入路径换掉就可以了：

```typescript
// 之前
import { chunk, groupBy, debounce } from 'lodash-es';

// 之后
import { chunk, groupBy, debounce } from 'es-toolkit';
```

es-toolkit 的 API 设计和 lodash 高度一致，很多函数可以直接替换，不需要改动调用代码。

### 使用兼容层（平滑过渡）

如果项目依赖了 lodash 的一些边缘行为，或者你希望先保证功能正常再逐步优化，可以使用 `es-toolkit/compat`：

```typescript
// 使用兼容层，行为与 lodash 完全一致
import { chunk } from 'es-toolkit/compat';

chunk([1, 2, 3, 4], 0);
// 返回 []，与 lodash 行为完全相同
```

从版本 1.39.3 开始，`es-toolkit/compat` 已经实现了对 lodash 100% 的兼容性，并通过了 lodash 自己的测试用例。Storybook、Recharts、CKEditor 等知名开源项目已经完成了迁移，也被 Nuxt 官方推荐使用。

兼容层的设计思路是作为过渡方案：先用 `es-toolkit/compat` 替换 lodash，保证业务不受影响；等稳定后，再逐步把 `compat` 替换为原始的 `es-toolkit`，获得最佳的性能和体积收益。

### 注意事项

有几个场景 `es-toolkit/compat` 有意不支持，迁移时需要留意：

- **隐式类型转换**：lodash 有些函数会把空字符串转成 0 或 false，es-toolkit 不做这种处理
- **方法链**：lodash 的 `_.chain().value()` 写法不支持，需要改成普通的函数调用
- **修改了原型的场景**：如果代码里修改过 `Array.prototype` 等内置原型，行为可能不一致

## 总结

如果你的项目还在用 lodash，es-toolkit 值得认真考虑迁移：

- **包体积**收益立竿见影，对性能敏感的应用尤其明显
- **TypeScript 类型**更准确，减少类型体操的麻烦
- **性能**在大多数场景下有 2-3 倍提升，某些函数甚至能到 10 倍以上
- **迁移成本低**，兼容层让你可以渐进式切换，不用一次性大改

lodash 在它的时代是无可替代的，但 JavaScript 已经今非昔比。es-toolkit 代表了现代工具库应有的样子：精简、快速、类型安全。
