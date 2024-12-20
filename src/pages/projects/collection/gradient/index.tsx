import { cn } from '@lib/utils';
import { Button } from '@react/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@react/ui/card';
import { Input } from '@react/ui/input';
import { Label } from '@react/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@react/ui/popover';
import { RadioGroup, RadioGroupItem } from '@react/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@react/ui/select';
import { Slider } from '@react/ui/slider';
import { Toaster } from '@react/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@react/ui/tabs';
import { Chrome } from '@uiw/react-color';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import html2canvas from 'html2canvas';
import { random } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';
import List from '../List';
import collections from './collection';

extend([namesPlugin]);

function generateGradientString({ colors, rotate, type }: {
  colors: string[];
  rotate?: number | undefined;
  type?: 'linear' | 'radial' | undefined;
}): string {
  if (type !== 'radial') {
    return `linear-gradient(${rotate || 0}deg, ${colors.join(', ')})`;
  }
  else {
    return `radial-gradient(${colors.join(', ')})`;
  }
}

collections.sort((a, b) => {
  const color1 = colord(a.colors[0]).toHsl();
  const color2 = colord(b.colors[0]).toHsl();
  if (color1.h !== color2.h) {
    return color1.h - color2.h;
  }
  else if (color1.s !== color2.s) {
    return color1.s - color2.s;
  }
  else {
    return color1.l - color2.l;
  }
});

function Gradient() {
  const [pickedIndex, setPickedIndex] = useState(() => random(0, collections.length - 1));
  const [colors, setColors] = useState<string[]>(collections[pickedIndex]!.colors);
  const [rotate, setRotate] = useState(collections[pickedIndex]!.rotate || 0);
  const [type, setType] = useState<'linear' | 'radial'>(collections[pickedIndex]!.type || 'linear');
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [imageFormat, setImageFormat] = useState('png');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const sizeOptions = [
    { category: '图标', height: 16, label: '16x16 - 网站图标', width: 16 },
    { category: '图标', height: 32, label: '32x32 - 图标', width: 32 },
    { category: '图标', height: 48, label: '48x48 - 应用图标', width: 48 },
    { category: '图标', height: 64, label: '64x64 - 大图标', width: 64 },
    { category: '图标', height: 128, label: '128x128 - 大图标', width: 128 },
    { category: '图标', height: 256, label: '256x256 - 高清图标', width: 256 },
    { category: '手机壁纸', height: 1136, label: '640x1136 - iPhone SE', width: 640 },
    { category: '手机壁纸', height: 1334, label: '750x1334 - iPhone 8', width: 750 },
    { category: '手机壁纸', height: 1792, label: '828x1792 - iPhone XR', width: 828 },
    { category: '手机壁纸', height: 1920, label: '1080x1920 - 手机壁纸', width: 1080 },
    { category: '手机壁纸', height: 2532, label: '1170x2532 - iPhone 12/13', width: 1170 },
    { category: '手机壁纸', height: 2778, label: '1284x2778 - iPhone 12/13 Pro Max', width: 1284 },
    { category: '桌面壁纸', height: 768, label: '1366x768 - 笔记本', width: 1366 },
    { category: '桌面壁纸', height: 1080, label: '1920x1080 - FHD', width: 1920 },
    { category: '桌面壁纸', height: 1440, label: '2560x1440 - 2K', width: 2560 },
    { category: '桌面壁纸', height: 2160, label: '3840x2160 - 4K', width: 3840 },
    { category: '社交媒体', height: 800, label: '800x800 - 微信朋友圈', width: 800 },
    { category: '社交媒体', height: 1080, label: '1080x1080 - Instagram', width: 1080 },
    { category: '社交媒体', height: 630, label: '1200x630 - Facebook', width: 1200 },
    { category: '社交媒体', height: 500, label: '1500x500 - Twitter 封面', width: 1500 },
    { category: '社交媒体', height: 1152, label: '2048x1152 - YouTube 封面', width: 2048 },
    { category: '常用比例', height: 800, label: '1:1 - 800x800', width: 800 },
    { category: '常用比例', height: 768, label: '4:3 - 1024x768', width: 1024 },
    { category: '常用比例', height: 720, label: '16:9 - 1280x720', width: 1280 },
    { category: '常用比例', height: 1080, label: '21:9 - 2560x1080', width: 2560 },
  ];
  const gradientString = useMemo(() => {
    return generateGradientString({
      colors,
      rotate,
      type,
    });
  }, [type, rotate, colors]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`background-image: ${gradientString};`);
    toast.success('复制成功！');
  };

  const handleExportImage = () => {
    const element = document.createElement('div');
    element.style.backgroundImage = gradientString;
    element.style.width = `${imageWidth}px`;
    element.style.height = `${imageHeight}px`;
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    html2canvas(element).then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL(`image/${imageFormat}`);
      link.download = `gradient.${imageFormat}`;
      link.click();
      document.body.removeChild(element);
    });
  };

  return (
    <div className="w-screen h-screen" style={{ backgroundImage: gradientString }}>
      <Toaster position="bottom-right" />
      <div className="fixed right-8 top-8 bottom-16 w-[435px] flex flex-col gap-4 flex-wrap-reverse">
        <List
          title={`渐变效果（共 ${collections.length} 个）`}
          description="点击列表可预览并微调"
          data={collections}
          renderItem={({ colors, rotate, type }, index) => (
            <div
              key={index}
              className={cn(
                'size-8 shadow-md rounded-full cursor-pointer ring-offset-2 transition-all duration-200',
                {
                  'hover:ring-white/50 hover:ring-2': index !== pickedIndex,
                  'ring-2 ': index === pickedIndex,
                },
              )}
              style={{ backgroundImage: generateGradientString({ colors, rotate, type }) }}
              onClick={() => {
                setPickedIndex(index);
                setColors(colors);
                setRotate(rotate || 0);
                setType(type || 'linear');
              }}
            />
          )}
        />
        <Card className="bg-white/40">
          <CardHeader>
            <CardTitle>渐变设置</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
              <Label className="w-20">渐变方式：</Label>
              <RadioGroup
                value={type}
                onValueChange={t => setType(t as 'linear' | 'radial')}
                className="flex gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="linear" id="linear" />
                  <Label htmlFor="linear">Linear</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="radial" id="radial" />
                  <Label htmlFor="radial">Radial</Label>
                </div>
              </RadioGroup>
            </div>
            {type !== 'radial' && (
              <div className="flex gap-2 items-center">
                <Label className="w-20">渐变角度：</Label>
                <Slider
                  className="flex-1"
                  value={[rotate]}
                  min={-360}
                  max={360}
                  step={5}
                  onValueChange={value => setRotate(value[0]!)}
                />
                <span className="w-8 text-right">
                  {rotate}
                  &deg;
                </span>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <Label className="w-20">颜色调整：</Label>
              <div
                className="flex-grow min-w-20 rounded-md group flex h-6 overflow-hidden shadow-sm"
                style={{ backgroundImage: generateGradientString({ colors, rotate: 90 }) }}
              >
                {colors.map((color, index) => (
                  <Popover key={index}>
                    <PopoverTrigger
                      className="flex-1 flex-shrink flex-grow hover:flex-[1.5] transition-all duration-200 overflow-hidden min-w-2 w-4"
                    >
                      <div
                        className={cn(
                          'opacity-0 group-hover:opacity-100 transition-all duration-200 h-full text-xs leading-6',
                          colord(color).isDark() ? 'text-white/80' : 'text-black/80',
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {color}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="flex justify-center p-0 w-auto border-0 shadow-none" side="top" sideOffset={12} asChild>
                      <Chrome
                        color={color}
                        onChange={e => setColors(colors.map((c, i) => (i === index ? e.hex : c)))}
                        /* @ts-expect-error ignore */
                        placement="B"
                        showEditableInput={false}
                      />
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/40 pt-6">
          <CardContent>
            <Tabs defaultValue="css">
              <TabsList>
                <TabsTrigger value="css">导出 CSS</TabsTrigger>
                <TabsTrigger value="image">导出图片</TabsTrigger>
              </TabsList>
              <TabsContent value="css">
                <div className="flex flex-col gap-2 mt-4">
                  <SyntaxHighlighter language="css" style={oneLight} className="text-xs font-monospace max-h-32 overflow-auto">
                    {`background-image:\n  ${gradientString};`}
                  </SyntaxHighlighter>
                  <Button
                    className="mt-2"
                    onClick={handleCopy}
                  >
                    复制到剪贴板
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="image">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">预设尺寸</Label>
                    <Select
                      value={selectedPreset}
                      onValueChange={(value) => {
                        setSelectedPreset(value);
                        const selectedSize = sizeOptions.find(option => option.label === value);
                        if (selectedSize) {
                          setImageWidth(selectedSize.width);
                          setImageHeight(selectedSize.height);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="选择尺寸模板" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(new Set(sizeOptions.map(option => option.category))).map(category => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              {category}
                            </div>
                            {sizeOptions
                              .filter(option => option.category === category)
                              .map(option => (
                                <SelectItem key={option.label} value={option.label}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">导出格式</Label>
                    <Select value={imageFormat} onValueChange={setImageFormat}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="webp">WEBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">宽度</Label>
                    <Input
                      type="number"
                      value={imageWidth}
                      onChange={(e) => {
                        setImageWidth(Number(e.target.value));
                        setSelectedPreset('');
                      }}
                      className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">高度</Label>
                    <Input
                      type="number"
                      value={imageHeight}
                      onChange={(e) => {
                        setImageHeight(Number(e.target.value));
                        setSelectedPreset('');
                      }}
                      className="w-full h-8 text-xs rounded-md border border-input bg-background"
                    />
                  </div>

                  <Button
                    size="sm"
                    className="col-span-2"
                    onClick={handleExportImage}
                  >
                    导出图片
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Gradient;
