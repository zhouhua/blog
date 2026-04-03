# 构建优化指南

> 目标：将构建内存从 12GB 降低到 8GB，减少 Bundle 大小 20%+

---

## 当前问题

- 开发环境需要 8GB 堆内存
- 生产构建需要 12GB 堆内存  
- Bundle 大小未优化
- 重型库未动态导入

---

## 优化步骤

### 1. 安装 Bundle 分析工具

```bash
pnpm add -D rollup-plugin-visualizer
```

### 2. 修改 astro.config.mjs

添加 Bundle 分析和代码分割配置。

### 3. 动态导入重型库

将 html2canvas、xlsx、mermaid 等改为按需加载。

### 4. 减少构建内存

修改 package.json 中的内存配置。

详细步骤请参考完整文档。
