# 超大组件重构指南

> 目标：将 760 行的 blurry 组件拆分为可维护的子组件
> 
> 预计时间：2-3 小时
> 优先级：中等

---

## 📊 当前问题分析

### 超大组件列表

| 组件 | 行数 | 主要问题 |
|------|------|---------|
| `blurry/_index.tsx` | 760 | 混合了 Canvas 渲染、表单管理、导出逻辑 |
| `animate-blurry/_index.tsx` | 448 | SVG 动画 + 表单状态管理 |
| `pattern/_index.tsx` | 402 | 复杂的颜色处理和渲染 |
| `gradient/_index.tsx` | 382 | SVG 生成和导出逻辑 |
| `link/_link.tsx` | 366 | 数据表格渲染 |

### 性能影响

- 多个 useEffect 依赖链导致频繁重新渲染
- 缺少 React.memo 优化
- 难以测试和维护
- 初始加载时间长

---

## 🎯 重构策略

### 原则

1. **单一职责**：每个组件只负责一个功能
2. **可测试性**：业务逻辑独立，易于单元测试
3. **性能优化**：使用 React.memo 和 useMemo
4. **保持功能**：重构不改变任何功能

### 目录结构

```
src/pages/projects/blurry/
├── _index.tsx              # 主组件（<150 行）
├── components/
│   ├── CanvasRenderer.tsx  # Canvas 渲染
│   ├── FormPanel.tsx       # 表单面板
│   ├── ExportHandler.tsx   # 导出功能
│   └── PreviewCard.tsx     # 预览卡片
├── hooks/
│   ├── useCanvasRender.ts  # Canvas 渲染逻辑
│   └── useImageExport.ts   # 导出逻辑
├── types/
│   └── index.ts            # 类型定义
└── utils/
    └── canvas.ts           # Canvas 工具函数
```

---

## 📝 实施步骤

### 步骤 1：创建目录结构

```bash
cd /Users/zhouhua/Documents/GitHub/blog/src/pages/projects/blurry
mkdir -p components hooks types utils
```

### 步骤 2：提取类型定义

创建 `types/index.ts`:

```typescript
export interface BlurryFormValues {
  type: 'type1' | 'type2';
  interlace: boolean;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  noiseIntensity: number;
  noiseScale: number;
}

export interface CanvasRendererProps {
  formValues: BlurryFormValues;
  width: number;
  height: number;
  imageUrl?: string;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  width: number;
  height: number;
}
```

### 步骤 3：提取 Canvas 渲染组件

创建 `components/CanvasRenderer.tsx`:

```typescript
import { memo, useEffect, useRef } from 'react';
import type { CanvasRendererProps } from '../types';

export const CanvasRenderer = memo(({ 
  formValues, 
  width, 
  height,
  imageUrl 
}: CanvasRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 渲染逻辑从原组件迁移
    renderCanvas(ctx, formValues, width, height, imageUrl);
  }, [formValues, width, height, imageUrl]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="max-w-full h-auto rounded-lg shadow-lg"
    />
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';

function renderCanvas(
  ctx: CanvasRenderingContext2D,
  formValues: BlurryFormValues,
  width: number,
  height: number,
  imageUrl?: string
) {
  // 从原组件的 useEffect 中提取渲染逻辑
  ctx.clearRect(0, 0, width, height);
  
  // 应用滤镜
  ctx.filter = `
    blur(${formValues.blur}px)
    brightness(${formValues.brightness}%)
    contrast(${formValues.contrast}%)
    saturate(${formValues.saturation}%)
    hue-rotate(${formValues.hue}deg)
  `;
  
  // 绘制图像或背景
  if (imageUrl) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = imageUrl;
  } else {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
  }
}
```

### 步骤 4：提取表单面板组件

创建 `components/FormPanel.tsx`:

```typescript
import { memo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { BlurryFormValues } from '../types';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl 
} from '@react/ui/form';
import { Slider } from '@react/ui/slider';
import { Switch } from '@react/ui/switch';
import { RadioGroup, RadioGroupItem } from '@react/ui/radio-group';

interface FormPanelProps {
  form: UseFormReturn<BlurryFormValues>;
}

export const FormPanel = memo(({ form }: FormPanelProps) => {
  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>类型</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="type1" id="type1" />
                    <label htmlFor="type1">类型 1</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="type2" id="type2" />
                    <label htmlFor="type2">类型 2</label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="blur"
          render={({ field }) => (
            <FormItem>
              <FormLabel>模糊度: {field.value}px</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* 其他表单字段... */}
      </form>
    </Form>
  );
});

FormPanel.displayName = 'FormPanel';
```

### 步骤 5：提取导出处理组件

创建 `components/ExportHandler.tsx`:

```typescript
import { memo, useCallback } from 'react';
import { Button } from '@react/ui/button';
import { Download } from 'lucide-react';
import type { BlurryFormValues, ExportOptions } from '../types';

interface ExportHandlerProps {
  formValues: BlurryFormValues;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  options: ExportOptions;
}

export const ExportHandler = memo(({ 
  formValues, 
  canvasRef,
  options 
}: ExportHandlerProps) => {
  const handleExport = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 动态导入 html2canvas 减少初始 bundle 大小
    const html2canvas = (await import('html2canvas')).default;
    
    const exportCanvas = await html2canvas(canvas, {
      backgroundColor: null,
      scale: 2,
    });
    
    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL(`image/${options.format}`, options.quality);
    link.download = `blurry-${Date.now()}.${options.format}`;
    link.click();
  }, [formValues, canvasRef, options]);
  
  return (
    <Button onClick={handleExport} className="w-full">
      <Download className="mr-2 h-4 w-4" />
      导出图片
    </Button>
  );
});

ExportHandler.displayName = 'ExportHandler';
```

### 步骤 6：重构主组件

修改 `_index.tsx`:

```typescript
import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CanvasRenderer } from './components/CanvasRenderer';
import { FormPanel } from './components/FormPanel';
import { ExportHandler } from './components/ExportHandler';
import type { BlurryFormValues, ExportOptions } from './types';

const formSchema = z.object({
  type: z.enum(['type1', 'type2']),
  interlace: z.boolean(),
  blur: z.number().min(0).max(100),
  brightness: z.number().min(0).max(200),
  contrast: z.number().min(0).max(200),
  saturation: z.number().min(0).max(200),
  hue: z.number().min(0).max(360),
  noiseIntensity: z.number().min(0).max(1),
  noiseScale: z.number().min(0).max(10),
});

function Blurry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 1.0,
    width: 800,
    height: 600,
  });
  
  const form = useForm<BlurryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'type1',
      interlace: false,
      blur: 50,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      noiseIntensity: 0.5,
      noiseScale: 1,
    },
  });
  
  const formValues = form.watch();
  
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex items-center justify-center">
          <CanvasRenderer
            formValues={formValues}
            width={exportOptions.width}
            height={exportOptions.height}
          />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Blurry 效果生成器</h1>
          
          <FormPanel form={form} />
          
          <ExportHandler
            formValues={formValues}
            canvasRef={canvasRef}
            options={exportOptions}
          />
        </div>
      </div>
    </div>
  );
}

export default Blurry;
```

---

## ✅ 验证清单

重构完成后，请验证以下内容：

- [ ] 所有功能正常工作（表单、Canvas 渲染、导出）
- [ ] 没有 TypeScript 错误
- [ ] 没有 ESLint 警告
- [ ] 组件使用 React.memo 优化
- [ ] 主组件少于 150 行
- [ ] 每个子组件职责单一
- [ ] 可以独立测试每个组件

---

## 🧪 测试建议

```typescript
// components/CanvasRenderer.test.tsx
import { render } from '@testing-library/react';
import { CanvasRenderer } from './CanvasRenderer';

describe('CanvasRenderer', () => {
  it('should render canvas with correct dimensions', () => {
    const { container } = render(
      <CanvasRenderer
        formValues={{
          type: 'type1',
          blur: 50,
          // ...
        }}
        width={800}
        height={600}
      />
    );
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });
});
```

---

## 📈 预期改进

| 指标 | 重构前 | 重构后 | 改进 |
|------|--------|--------|------|
| 主组件行数 | 760 | <150 | -80% |
| 可测试性 | 低 | 高 | ✅ |
| 可维护性 | 低 | 高 | ✅ |
| 性能 | 一般 | 优 | ✅ |

---

## 🔄 其他组件重构

使用相同的策略重构其他大型组件：

1. `animate-blurry/_index.tsx` (448 行)
2. `pattern/_index.tsx` (402 行)
3. `gradient/_index.tsx` (382 行)
4. `link/_link.tsx` (366 行)

每个组件的重构时间约 1-2 小时。

---

## 💡 最佳实践

1. **逐步重构**：一次重构一个组件，确保功能正常
2. **保留原文件**：重构前备份原文件（如 `_index.tsx.backup`）
3. **频繁测试**：每完成一个子组件就测试一次
4. **提交记录**：每个子组件完成后提交一次 Git
5. **性能测试**：使用 React DevTools Profiler 验证性能改进

---

## 📞 需要帮助？

如果在重构过程中遇到问题：
1. 检查类型定义是否正确
2. 确保所有依赖都已导入
3. 使用 React DevTools 调试组件渲染
4. 参考其他已重构的组件

**重要提示**：重构是一个渐进的过程，不要急于一次完成所有组件。先重构一个，验证无误后再继续下一个。
