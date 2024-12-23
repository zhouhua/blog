import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { sizeOptions } from '@lib/projects';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { Button } from '@react/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@react/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@react/ui/form';
import { Input } from '@react/ui/input';
import { Label } from '@react/ui/label';
import { Popover, PopoverContent } from '@react/ui/popover';
import { RadioGroup, RadioGroupItem } from '@react/ui/radio-group';
import { RainbowButton } from '@react/ui/rainbow-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@react/ui/select';
import { Slider } from '@react/ui/slider';
import { Toaster } from '@react/ui/sonner';
import { Chrome } from '@uiw/react-color';
import { random as randomColor } from 'colord';
import { random } from 'lodash-es';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWindowSize } from 'react-use';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  background: z.string(),
  blendMode: z.enum(['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']),
  blur: z.number().min(0.2).max(2),
  colors: z.array(z.string()).length(2),
  num: z.number().min(2).max(10),
  type: z.enum(['type1', 'type2']),
  zoom: z.number().min(0.2).max(5),
});

const TYPE_LABELS: Record<z.infer<typeof formSchema>['type'], string> = {
  type1: '融合',
  type2: '交错',
} as const;

function Blurry() {
  const { height, width } = useWindowSize();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      background: '#ffffff',
      blendMode: 'normal',
      blur: 1,
      colors: ['#fff', '#fff'],
      num: 5,
      type: 'type1',
      zoom: 1,
    },
    resolver: zodResolver(formSchema),
  });
  const formValues = form.watch();
  const [blurLength, setBlurLength] = useState(0);
  const [circles, setCircles] = useState<ReactNode[]>([]);
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [imageFormat, setImageFormat] = useState('png');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const generate = useCallback(() => {
    const length = Math.min(width, height);
    const blur = length / (formValues.type === 'type1' ? 6 : 10);
    setBlurLength(random(blur * 0.9, blur * 1.1));
    const nodes: ReactNode[] = [];
    if (formValues.type === 'type1') {
      for (let i = 0; i < formValues.num; i++) {
        nodes.push(
          <circle
            key={i}
            cx={random(width)}
            cy={random(height)}
            r={random(length * 0.95, length * 1.05) / 2 * formValues.zoom}
            fill={`url(#gradient${i % 2 ? 2 : 1})`}
            style={{ mixBlendMode: formValues.blendMode }}
          />,
        );
      }
    }
    else {
      const angel = random(0, Math.PI * 2);
      const x = random(width * 0.4, width * 0.6);
      const y = random(height * 0.4, height * 0.6);
      const r1 = random(length * 0.95, length * 1.05) / 4.5 * formValues.zoom;
      const r2 = random(length * 0.95, length * 1.05) / 5 * formValues.zoom;
      const deltaX = Math.cos(angel) * r1 * 0.8;
      const deltaY = Math.sin(angel) * r1 * 0.8;
      nodes.push(
        <circle
          cx={x}
          cy={y}
          r={r1}
          fill="url(#gradient1)"
          style={{ mixBlendMode: formValues.blendMode }}
        />,
      );
      nodes.push(
        <circle
          cx={x + deltaX}
          cy={y + deltaY}
          r={r2}
          fill="url(#gradient2)"
          style={{ mixBlendMode: formValues.blendMode }}
        />,
      );
    }
    setCircles(nodes);
  }, [width, height, formValues.type, formValues.num, formValues.zoom, formValues.blendMode]);

  const setDefaultBg = useCallback(() => {
    form.setValue('background', form.getValues().type !== 'type2' ? form.getValues().colors[0]! : '#ffffffff');
  }, [form]);

  const generateColors = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    const color2 = randomColor();
    const color1 = color2.rotate(
      random(formValues.type === 'type1' ? 50 : 60, formValues.type === 'type1' ? 70 : 140) * (Math.random() > 0.5 ? 1 : -1),
    ).saturate(random(0.15, 0.2)).lighten(random(0, 0.5));
    form.setValue('colors', [color1.toHex(), color2.toHex()]);
    form.setValue('background', form.getValues().type !== 'type2' ? color1.toHex() : '#ffffffff');
    generate();
    e?.preventDefault();
  }, [form, formValues.type, generate]);

  useLayoutEffect(() => {
    generateColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDefaultBg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.type]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.num, formValues.type, formValues.colors, formValues.blur, formValues.zoom, width, height]);

  const handleExportImage = useCallback(() => {
    const svg = document.querySelector('svg')!;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    const ctx = canvas.getContext('2d')!;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      const link = document.createElement('a');
      link.href = canvas.toDataURL(`image/${imageFormat}`);
      link.download = `blurry.${imageFormat}`;
      link.click();
      toast.success('导出成功！');
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [imageWidth, imageHeight, imageFormat]);

  return (
    <div
      className="w-sceen h-screen flex flex-col items-center justify-center relative gap-10"
      data-vaul-drawer-wrapper
    >
      <Toaster position="bottom-right" />
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className="absolute z-0 left-0 top-0 w-full h-full">
        <defs>
          <filter id="blur" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode={formValues.blendMode} in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur
              stdDeviation={Math.floor(blurLength * formValues.blur)}
              result="effect1_foregroundBlur"
            />
          </filter>
          <radialGradient id="gradient1">
            <stop offset="0%" stopColor={formValues.colors[0]} stopOpacity="1" />
            <stop offset="80%" stopColor={formValues.colors[0]} stopOpacity="1" />
            <stop offset="100%" stopColor={formValues.colors[0]} stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="gradient2">
            <stop offset="0%" stopColor={formValues.colors[1]} stopOpacity="1" />
            <stop offset="80%" stopColor={formValues.colors[1]} stopOpacity="1" />
            <stop offset="100%" stopColor={formValues.colors[1]} stopOpacity="0.5" />
          </radialGradient>
        </defs>
        <g filter="url(#blur)">
          <rect x="0" y="0" width={width} height={height} fill={formValues.background} />
          {circles}
        </g>
      </svg>
      <div className="fixed right-8 top-8 w-80 z-10 flex flex-col gap-6 bottom-16 flex-wrap-reverse">
        <Card className="bg-white/40">
          <CardHeader>
            <CardTitle>模糊背景生成</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form>
                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">效果类型：</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center gap-4"
                        >
                          {(Object.entries(TYPE_LABELS) as [z.infer<typeof formSchema>['type'], string][]).map(([value, label]) => (
                            <FormItem key={value} className="flex items-center gap-2">
                              <FormControl>
                                <RadioGroupItem value={value} />
                              </FormControl>
                              <FormLabel className="font-normal !mt-0">
                                {label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="blur"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">模糊程度：</FormLabel>
                      <FormControl>
                        <Slider
                          max={2}
                          step={0.1}
                          min={0.2}
                          value={[field.value]}
                          onValueChange={e => field.onChange(e[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {formValues.type !== 'type2' && (
                  <FormField
                    name="num"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex gap-1 items-center h-12">
                        <FormLabel className="w-20  shrink-0">光点数量：</FormLabel>
                        <FormControl>
                          <Slider
                            className="relative flex items-center w-full h-5 touch-none select-none"
                            max={10}
                            step={1}
                            min={2}
                            value={[field.value]}
                            onValueChange={e => field.onChange(e[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  name="zoom"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">光点大小：</FormLabel>
                      <FormControl>
                        <Slider
                          className="flex-shrink"
                          max={5}
                          step={0.1}
                          min={0.2}
                          value={[field.value]}
                          onValueChange={e => field.onChange(e[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="blendMode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">混合模式：</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">normal</SelectItem>
                            <SelectItem value="multiply">multiply</SelectItem>
                            <SelectItem value="screen">screen</SelectItem>
                            <SelectItem value="overlay">overlay</SelectItem>
                            <SelectItem value="darken">darken</SelectItem>
                            <SelectItem value="lighten">lighten</SelectItem>
                            <SelectItem value="color-dodge">color-dodge</SelectItem>
                            <SelectItem value="color-burn">color-burn</SelectItem>
                            <SelectItem value="hard-light">hard-light</SelectItem>
                            <SelectItem value="soft-light">soft-light</SelectItem>
                            <SelectItem value="difference">difference</SelectItem>
                            <SelectItem value="exclusion">exclusion</SelectItem>
                            <SelectItem value="hue">hue</SelectItem>
                            <SelectItem value="saturation">saturation</SelectItem>
                            <SelectItem value="color">color</SelectItem>
                            <SelectItem value="luminosity">luminosity</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormItem className="flex gap-1 items-center h-12">
                  <FormLabel className="w-20  shrink-0">调整颜色：</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center justify-between w-full">
                      <div className="flex gap-2">
                        {formValues.colors.map((color, index) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <Popover key={index}>
                            <PopoverTrigger>
                              <div className="size-8 rounded-md shadow-md" style={{ background: color }} />
                            </PopoverTrigger>
                            <PopoverContent className="flex justify-center p-0 w-auto border-0 shadow-none" side="top" sideOffset={12}>
                              <Chrome
                                color={color}
                                onChange={e => form.setValue(`colors.${index}`, e.hex)}
                                showEditableInput={false}
                              />
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" onClick={generateColors}>随机颜色</Button>
                    </div>
                  </FormControl>
                </FormItem>
                <FormField
                  name="background"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">背景色：</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger>
                            <div className="size-8 rounded-md shadow-md" style={{ background: field.value }} />
                          </PopoverTrigger>
                          <PopoverContent className="flex justify-center p-0 w-auto border-0 shadow-none" side="top" sideOffset={12}>
                            <Chrome
                              color={field.value}
                              onChange={e => field.onChange(e.hex)}
                              showEditableInput={false}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <div className="flex justify-center mt-12">
              <RainbowButton onClick={generate}>重新生成</RainbowButton>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/40">
          <CardHeader>
            <CardTitle>导出图片</CardTitle>
          </CardHeader>
          <CardContent>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Blurry;
