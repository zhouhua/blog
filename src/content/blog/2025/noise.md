---
title: 图像噪点生成技术简介
tags:
  - svg
  - 设计
category: 技术
hero: ./noise.jpg
type: post
featured: true
date: 2025-01-07 10:00:00
heroCopyright: Photo by <a href="https://unsplash.com/@aedrian?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Aedrian Salazar</a> on <a href="https://unsplash.com/photos/a-purple-and-red-abstract-background-with-a-black-background-m0yjpgy5vOE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
---

## 简介

噪点效果在现代设计中扮演着重要角色，它不仅能为图像添加质感，还能创造独特的视觉效果。通过在图像中添加随机的变化，噪点可以模拟自然界中的纹理，打破完美但单调的数字效果，为设计作品增添生命力和真实感。

在现代网页和软件设计中，噪点效果的应用越来越广泛。它可以用于增强纹理质感（如模拟纸张、布料、金属等材质），软化渐变过渡（避免大面积渐变中的色带问题），创造复古风格（模拟胶片颗粒感），或者为 UI 元素增添层次感。

![Arc](./noise/arc.png)

## 技术发展背景

### Perlin 噪声

Perlin 噪声是由 Ken Perlin 在 1982 年为电影《TRON》开发的程序化纹理生成技术。它的主要特点是能够生成自然、连续的随机效果，避免了完全随机噪声的杂乱感。这项技术因其在计算机图形学中的重要贡献，使 Ken Perlin 获得了 1997 年的奥斯卡科技成就奖。

#### Perlin 噪声实现

```typescript
class PerlinNoise {
  private permutation: number[] = [];
  private p: number[] = [];

  constructor() {
    // 创建一个包含 0-255 的数组
    for (let i = 0; i &lt; 256; i++) {
      this.permutation[i] = i;
    }

    // Fisher-Yates 洗牌算法
    for (let i = 255; i &gt; 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }

    // 复制数组以简化边界计算
    for (let i = 0; i &lt; 512; i++) {
      this.p[i] = this.permutation[i & 255];
    }
  }

  private fade(t: number): number {
    // 6t^5 - 15t^4 + 10t^3
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    // 将 hash 转换为 0-15 之间的值
    const h = hash & 15;
    // 根据 hash 选择梯度向量
    const u = h &lt; 8 ? x : y;
    const v = h &lt; 4 ? y : h === 12 || h === 14 ? x : z;
    // 根据 hash 的最低位决定正负
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  public noise(x: number, y: number, z: number): number {
    // 找到点所在的单位立方体
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    // 计算相对坐标
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    // 计算淡化曲线
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    // 计算哈希值
    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    // 插值混合
    return this.lerp(
      this.lerp(
        this.lerp(
          this.grad(this.p[AA], x, y, z),
          this.grad(this.p[BA], x - 1, y, z),
          u
        ),
        this.lerp(
          this.grad(this.p[AB], x, y - 1, z),
          this.grad(this.p[BB], x - 1, y - 1, z),
          u
        ),
        v
      ),
      this.lerp(
        this.lerp(
          this.grad(this.p[AA + 1], x, y, z - 1),
          this.grad(this.p[BA + 1], x - 1, y, z - 1),
          u
        ),
        this.lerp(
          this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1),
          u
        ),
        v
      ),
      w
    );
  }
}
```

使用示例：

```typescript
const perlin = new PerlinNoise();

// 生成 2D 噪声图
function generate2DNoise(width: number, height: number, scale: number = 50): number[][] {
  const noise: number[][] = [];
  
  for (let y = 0; y &lt; height; y++) {
    noise[y] = [];
    for (let x = 0; x &lt; width; x++) {
      // 将值归一化到 0-1 范围
      const value = (perlin.noise(x / scale, y / scale, 0) + 1) * 0.5;
      noise[y][x] = value;
    }
  }
  
  return noise;
}
```

<iframe
  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
  src="https://noise-examples.vercel.app/perlin"
  frameborder="0"
  dragable="false"
  allowfullscreen
  allow="encrypted-media"
  referrerpolicy
  style="border-radius:8px;height:550px;width:750px;"
></iframe>


### 分形噪声

分形噪声是基于 Perlin 噪声的改进版本，通过叠加不同频率和振幅的 Perlin 噪声来创造更丰富的细节。这种技术广泛应用于地形生成、云雾效果和自然纹理的创建。

#### 分形噪声实现

```typescript
class FractalNoise {
  private perlin: PerlinNoise;
  private octaves: number;
  private persistence: number;
  private lacunarity: number;

  constructor(octaves: number = 6, persistence: number = 0.5, lacunarity: number = 2) {
    this.perlin = new PerlinNoise();
    this.octaves = octaves;
    this.persistence = persistence; // 控制振幅减少的速率
    this.lacunarity = lacunarity; // 控制频率增加的速率
  }

  public noise(x: number, y: number, z: number = 0): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i &lt; this.octaves; i++) {
      total += this.perlin.noise(
        x * frequency,
        y * frequency,
        z * frequency
      ) * amplitude;

      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    // 归一化到 [-1, 1] 范围
    return total / maxValue;
  }
}
```

使用示例：

```typescript
const fractal = new FractalNoise(6, 0.5, 2);

// 生成分形噪声纹理
function generateFractalTexture(width: number, height: number, scale: number = 50): number[][] {
  const texture: number[][] = [];
  
  for (let y = 0; y &lt; height; y++) {
    texture[y] = [];
    for (let x = 0; x &lt; width; x++) {
      // 将值归一化到 0-1 范围
      const value = (fractal.noise(x / scale, y / scale) + 1) * 0.5;
      texture[y][x] = value;
    }
  }
  
  return texture;
}
```

<iframe
  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
  src="https://noise-examples.vercel.app/fractal"
  frameborder="0"
  dragable="false"
  allowfullscreen
  allow="encrypted-media"
  referrerpolicy
  style="border-radius:8px;height:550px;width:750px;"
></iframe>

## SVG 噪点实现技术

### feTurbulence 滤镜

feTurbulence 是 SVG 滤镜中用于生成噪点效果的核心元素。它内部实现了基于 Perlin 噪声的算法，使我们能够在浏览器中直接生成高质量的噪点效果，而无需自己实现复杂的噪声算法。

#### 基本语法

```html
<filter id="noise">
  <feTurbulence 
    type="fractalNoise" 
    baseFrequency="0.65" 
    numOctaves="3" 
    stitchTiles="stitch"
  />
</filter>
```

#### 关键属性说明

##### type

- fractalNoise：分形噪声，产生更自然的效果。适合模拟云雾、地形等自然纹理。

  ```html
  <!-- 分形噪声示例 -->
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
    <defs>
      <filter id="fractalNoiseDemo">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.01"
          numOctaves="5"
        />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#fractalNoiseDemo)"/>
  </svg>
  ```

  效果展示：

  ```typescript
  // 生成不同参数的分形噪声效果
  const fractalNoiseExamples = [
    { baseFrequency: 0.01, numOctaves: 5, description: '云雾效果' },
    { baseFrequency: 0.05, numOctaves: 3, description: '大理石纹理' },
    { baseFrequency: 0.1, numOctaves: 2, description: '地形高度图' },
  ].map(({ baseFrequency, numOctaves, description }) => `
    <div class="example">
      <svg width="200" height="100">
        <defs>
          <filter id="fractalNoise${baseFrequency}">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="${baseFrequency}"
              numOctaves="${numOctaves}"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#fractalNoise${baseFrequency})"/>
      </svg>
      <p>${description}</p>
    </div>
  `);
  ```

  <iframe 
    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
    src="https://noise-examples.vercel.app/svg-fractal" 
    frameborder="0" 
    dragable="false" 
    allowfullscreen 
    allow="encrypted-media" 
    referrerpolicy 
    style="border-radius:8px;height:1000px;width:750px;"
  ></iframe>

- turbulence：湍流噪声，产生更随机的效果。适合创造更具动感和混乱感的纹理。

  ```html
  <!-- 湍流噪声示例 -->
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
    <defs>
      <filter id="turbulenceDemo">
        <feTurbulence 
          type="turbulence" 
          baseFrequency="0.01"
          numOctaves="5"
        />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#turbulenceDemo)"/>
  </svg>
  ```

  效果展示：

  ```typescript
  // 生成不同参数的湍流噪声效果
  const turbulenceExamples = [
    { baseFrequency: 0.01, numOctaves: 5, description: '火焰效果' },
    { baseFrequency: 0.05, numOctaves: 3, description: '水波纹理' },
    { baseFrequency: 0.1, numOctaves: 2, description: '电流效果' },
  ].map(({ baseFrequency, numOctaves, description }) => `
    <div class="example">
      <svg width="200" height="100">
        <defs>
          <filter id="turbulence${baseFrequency}">
            <feTurbulence 
              type="turbulence" 
              baseFrequency="${baseFrequency}"
              numOctaves="${numOctaves}"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#turbulence${baseFrequency})"/>
      </svg>
      <p>${description}</p>
    </div>
  `);
  ```

  <iframe 
    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
    src="https://noise-examples.vercel.app/svg-turbulence" 
    frameborder="0" 
    dragable="false" 
    allowfullscreen 
    allow="encrypted-media" 
    referrerpolicy 
    style="border-radius:8px;height:1000px;width:750px;"
  ></iframe>

  对比说明：

  | 噪声类型 | 特点 | 适合模拟的效果 |
  | -------- | ---- | -------------- |
  | 分形噪声（fractalNoise） | 产生更平滑、连续的噪声图案，各个尺度的细节过渡自然 | 云层、雾气效果，地形起伏，大理石纹理，磨砂玻璃，纸张纹理 |
  | 湍流噪声（turbulence） | 产生更锐利、不规则的噪声图案，具有明显的方向性和流动感 | 火焰、烟雾效果，水波纹，电流、闪电，能量场，动态纹理 |


> 上述效果可以通过调整 baseFrequency、numOctaves 等参数，以及配合其他 SVG 滤镜（如 feColorMatrix、feDisplacementMap 等）来获得更丰富的视觉效果。

##### baseFrequency

- 控制噪点的基本大小
- 取值范围：0.0-1.0
- 可以使用两个值分别控制 x 和 y 方向
- 较小的值会产生更大的噪点，较大的值会产生更细密的噪点

##### numOctaves

- 控制叠加的噪声层数
- 值越大，细节越丰富，计算成本越高

##### stitchTiles

- stitch：确保图案在平铺时无缝连接，适合创建可重复的背景
- noStitch：不进行边缘处理，适合单次使用的效果

##### seed

- 随机种子值
- 不同的值会产生不同的噪点图案
- 相同的种子值会产生相同的噪点图案，适合需要一致性的场景

### 图像噪点生成示例

由以上背景知识，我们只需要通过 svg 的 feTurbulence 滤镜，并设置较大的 baseFrequency 值，就可以轻松得到细密、均匀、随机的噪点图案。

<iframe 
  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
  src="https://noise-examples.vercel.app/noise" 
  frameborder="0" 
  dragable="false" 
  allowfullscreen 
  allow="encrypted-media" 
  referrerpolicy 
  style="border-radius:8px;height:1000px;width:750px;"
></iframe>

### 更多示例

#### 毛玻璃效果：

<iframe 
  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
  src="https://noise-examples.vercel.app/frosted-glass" 
  frameborder="0" 
  dragable="false" 
  allowfullscreen 
  allow="encrypted-media" 
  referrerpolicy 
  style="border-radius:8px;height:1000px;width:750px;"
></iframe>

……

### 性能优化建议

#### 合理使用 numOctaves

- 值越大，渲染成本越高
- 建议在视觉效果和性能之间找到平衡
- 对于移动设备，建议使用较小的值
- 在高性能设备上可以适当增加

#### 优化 baseFrequency

- 较小的值会产生更大的噪点，渲染压力更小
- 可以通过调整 opacity 来平衡视觉效果
- 在移动设备上可以适当增加频率，减小噪点尺寸

#### 预渲染与降级处理

```typescript
// 预渲染噪点纹理
function preRenderNoise(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // 创建 SVG 数据 URL
  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)"/>
    </svg>
  `;
  
  // 转换为 base64
  const svg = btoa(svgData);
  
  // 创建图片对象
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${svg}`;
  
  // 渲染到 canvas
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
  
  return canvas.toDataURL();
}
```
