import { zodResolver } from '@hookform/resolvers/zod';
import { sizeOptions } from '@lib/projects';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { HelpDrawer } from '@react/components/HelpDrawer';
import { LanguageSwitch } from '@react/components/LanguageSwitch';
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
import { colord, random as randomColor } from 'colord';
import { random, throttle } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  background: z.string(),
  blur: z.number().min(0.2).max(2),
  colors: z.array(z.string()).length(2),
  num: z.number().min(2).max(10),
  type: z.enum(['type1', 'type2']),
  zoom: z.number().min(0.2).max(5),
});

const TYPE_LABELS: Record<z.infer<typeof formSchema>['type'], string> = {
  type1: 'blurry.merge',
  type2: 'blurry.interlace',
} as const;

function Blurry() {
  const { t } = useTranslation();
  const size = useWindowSize();
  const [{ height, width }, setSize] = useState(size);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const generateRef = useRef<(() => void) | undefined>(undefined);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      background: '#ffffff',
      blur: 1,
      colors: ['#ffffff', '#ffffff'],
      num: 5,
      type: 'type1',
      zoom: 1,
    },
    resolver: zodResolver(formSchema),
  });
  const formType = form.watch('type');
  const formBackground = form.watch('background');
  const formColors = form.watch('colors');
  const formNum = form.watch('num');
  const formZoom = form.watch('zoom');
  const formBlur = form.watch('blur');

  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [imageFormat, setImageFormat] = useState('png');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // 处理容器尺寸变化
  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current)
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = Math.floor(rect.width);
    const newHeight = Math.floor(rect.height);

    // 只在尺寸真正变化时更新
    if (newWidth !== width || newHeight !== height) {
      setSize({ height: newHeight, width: newWidth });

      // 更新 canvas 尺寸
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;

      // 更新离屏 canvas 尺寸
      if (offscreenCanvasRef.current) {
        offscreenCanvasRef.current.width = newWidth;
        offscreenCanvasRef.current.height = newHeight;
      }
    }
  }, [width, height]);

  // 使用 ResizeObserver 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current)
      return;

    const resizeObserver = new ResizeObserver(throttle(() => {
      updateCanvasSize();
      generateRef.current?.();
    }, 100));

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateCanvasSize]);

  // 创建离屏Canvas
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
  }, [width, height]);

  // 渲染圆形渐变
  const drawCircle = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
  ) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const c = colord(color);

    if (formType === 'type1') {
      // 为 type1 模式优化渐变效果
      const alpha = c.alpha();
      gradient.addColorStop(0, c.toRgbString());
      gradient.addColorStop(0.2, c.alpha(0.8 * alpha).toRgbString());
      gradient.addColorStop(0.4, c.alpha(0.6 * alpha).toRgbString());
      gradient.addColorStop(0.6, c.alpha(0.4 * alpha).toRgbString());
      gradient.addColorStop(0.8, c.alpha(0.2 * alpha).toRgbString());
      gradient.addColorStop(1, c.alpha(0).toRgbString());
    }
    else {
      // type2 保持原有效果
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.8, color);
      gradient.addColorStop(1, c.alpha(0).toRgbString());
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, [formType]);

  // 渲染到指定的 canvas 上下文
  const renderToContext = useCallback((
    ctx: CanvasRenderingContext2D,
    targetWidth: number,
    targetHeight: number,
    options?: { skipBackground?: boolean },
  ) => {
    if (!offscreenCanvasRef.current)
      return;

    const offscreenCtx = offscreenCanvasRef.current.getContext('2d')!;
    const length = Math.min(targetWidth, targetHeight);
    const blur = length / (formType === 'type1' ? 8 : 12);
    const blurAmount = random(blur * 0.9, blur * 1.1);

    // 设置画布尺寸
    offscreenCanvasRef.current.width = targetWidth;
    offscreenCanvasRef.current.height = targetHeight;

    // 清除画布
    if (!options?.skipBackground) {
      ctx.fillStyle = formBackground;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    offscreenCtx.clearRect(0, 0, targetWidth, targetHeight);

    // 创建第二个离屏 canvas 用于模糊效果
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = targetWidth;
    blurCanvas.height = targetHeight;
    const blurCtx = blurCanvas.getContext('2d')!;

    // 设置混合模式
    offscreenCtx.globalCompositeOperation = 'source-over';
    blurCtx.globalCompositeOperation = formType === 'type1' ? 'soft-light' : 'color-burn';

    if (formType === 'type1') {
      const actualNum = formNum * 2;
      for (let i = 0; i < actualNum; i++) {
        const x = random(targetWidth);
        const y = random(targetHeight);
        const radius = random(length * 1.2, length * 1.4) / 2 * formZoom;
        // 先在离屏 canvas 上绘制
        drawCircle(offscreenCtx, x, y, radius, formColors[i % 2]!);
      }
    }
    else {
      const angel = random(0, Math.PI * 2);
      const x = random(targetWidth * 0.4, targetWidth * 0.6);
      const y = random(targetHeight * 0.4, targetHeight * 0.6);
      const r1 = random(length * 0.95, length * 1.05) / 4.5 * formZoom;
      const r2 = random(length * 0.95, length * 1.05) / 5 * formZoom;
      const deltaX = Math.cos(angel) * r1 * 0.8;
      const deltaY = Math.sin(angel) * r1 * 0.8;

      drawCircle(offscreenCtx, x, y, r1, formColors[0]!);
      drawCircle(offscreenCtx, x + deltaX, y + deltaY, r2, formColors[1]!);
    }

    // 应用模糊效果
    blurCtx.filter = `blur(${Math.floor(blurAmount * formBlur)}px)`;
    blurCtx.drawImage(offscreenCanvasRef.current, 0, 0);

    // 将模糊后的图像绘制到主画布
    ctx.drawImage(blurCanvas, 0, 0);
  }, [formType, formBackground, formColors, formNum, formZoom, formBlur, drawCircle]);

  const throttledGenerate = useCallback(
    throttle((ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (!ctx)
        return;
      renderToContext(ctx, w, h);
    }, 100, { leading: true, trailing: true }),
    [renderToContext],
  );

  const generate = useCallback(() => {
    if (!canvasRef.current)
      return;
    const ctx = canvasRef.current.getContext('2d')!;
    throttledGenerate(ctx, width, height);
  }, [width, height, throttledGenerate]);

  // 保存 generate 函数的引用
  useEffect(() => {
    generateRef.current = generate;
  }, [generate]);

  const setDefaultBg = useCallback(() => {
    form.setValue('background', formType !== 'type2' ? formColors[0]! : '#ffffffff');
  }, [form, formType, formColors]);

  const generateColors = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    const color2 = randomColor();
    const color1 = color2.rotate(
      random(formType === 'type1' ? 50 : 60, formType === 'type1' ? 70 : 140) * (Math.random() > 0.5 ? 1 : -1),
    ).saturate(random(0.15, 0.2)).lighten(random(0, 0.5));
    form.setValue('colors', [color1.toHex(), color2.toHex()]);
    form.setValue('background', formType !== 'type2' ? color1.toHex() : '#ffffffff');
    generate();
    e?.preventDefault();
  }, [form, formType, generate]);

  // 初始化
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setSize(rect);
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
      generateColors();
    }
  }, []);

  // 监听表单变化
  useEffect(() => {
    generate();
  }, [formType, formBackground, formColors, formNum, formZoom, formBlur, generate]);

  // 监听类型变化
  useEffect(() => {
    setDefaultBg();
  }, [formType, setDefaultBg]);

  const handleExportImage = () => {
    if (!canvasRef.current)
      return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = imageWidth;
    exportCanvas.height = imageHeight;
    const exportCtx = exportCanvas.getContext('2d')!;

    // 使用相同的渲染逻辑，但是针对导出尺寸
    renderToContext(exportCtx, imageWidth, imageHeight);

    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL(`image/${imageFormat}`);
    link.download = `blurry.${imageFormat}`;
    link.click();
    toast.success('导出成功！');
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div
        className="p-2 bg-border h-[calc(100vh-40px)] w-screen flex gap-2"
        data-vaul-drawer-wrapper
      >
        <div className="fixed top-4 right-4 flex gap-2 z-50">
          <HelpDrawer namespace="blurry" />
          <LanguageSwitch />
        </div>
        <div
          ref={containerRef}
          className="w-full h-full grow shrink rounded-md overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>

        <div className="flex flex-col gap-2 bottom-16">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t('blurry.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form>
                  <FormField
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex gap-1 items-center h-10">
                        <FormLabel className="w-20  shrink-0">
                          {t('blurry.effectType')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4 !mt-0"
                          >
                            {(Object.entries(TYPE_LABELS) as [z.infer<typeof formSchema>['type'], string][]).map(([value, label]) => (
                              <FormItem key={value} className="flex items-center gap-2">
                                <FormControl>
                                  <RadioGroupItem value={value} />
                                </FormControl>
                                <FormLabel className="font-normal !mt-0">
                                  {t(label)}
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
                      <FormItem className="flex gap-1 items-center h-10">
                        <FormLabel className="w-20  shrink-0">
                          {t('blurry.blurLevel')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <Slider
                            max={2}
                            step={0.1}
                            min={0.2}
                            value={[field.value]}
                            onValueChange={e => field.onChange(e[0])}
                            className="!mt-0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {formType !== 'type2' && (
                    <FormField
                      name="num"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="flex gap-1 items-center h-10">
                          <FormLabel className="w-20  shrink-0">
                            {t('blurry.dotsNumber')}
                            ：
                          </FormLabel>
                          <FormControl>
                            <Slider
                              className="relative flex items-center w-full h-5 touch-none select-none !mt-0"
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
                      <FormItem className="flex gap-1 items-center h-10">
                        <FormLabel className="w-20  shrink-0">
                          {t('blurry.dotsSize')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <Slider
                            className="flex-shrink !mt-0"
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
                  <FormItem className="flex gap-1 items-center h-10">
                    <FormLabel className="w-20  shrink-0">
                      {t('blurry.adjustColors')}
                      ：
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center justify-between w-full !mt-0">
                        <div className="flex gap-2">
                          {formColors.map((color, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Popover key={index}>
                              <PopoverTrigger>
                                <div className="size-8 rounded-md shadow-md" style={{ background: color }} />
                              </PopoverTrigger>
                              <PopoverContent className="flex justify-center p-0 w-auto border-0 shadow-none" side="top" sideOffset={12}>
                                <Chrome
                                  color={color}
                                  onChange={e => form.setValue(`colors.${index}`, e.hexa)}
                                  showEditableInput={false}
                                />
                              </PopoverContent>
                            </Popover>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" onClick={generateColors}>{t('blurry.randomColor')}</Button>
                      </div>
                    </FormControl>
                  </FormItem>
                  <FormField
                    name="background"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex gap-1 items-center h-10 !mt-0">
                        <FormLabel className="w-20  shrink-0">
                          {t('blurry.backgroundColor')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger>
                              <div className="size-8 rounded-md shadow-md" style={{ background: field.value }} />
                            </PopoverTrigger>
                            <PopoverContent className="flex justify-center p-0 w-auto border-0 shadow-none" side="top" sideOffset={12}>
                              <Chrome
                                color={field.value}
                                onChange={e => field.onChange(e.hexa)}
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
              <div className="flex justify-center mt-4">
                <RainbowButton onClick={generate}>{t('blurry.regenerate')}</RainbowButton>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t('blurry.exportImage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs">{t('blurry.presetSize')}</Label>
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
                  <Label className="text-xs">{t('blurry.exportFormat')}</Label>
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
                  <Label className="text-xs">{t('blurry.width')}</Label>
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
                  <Label className="text-xs">{t('blurry.height')}</Label>
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
                  {t('blurry.exportImage')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
export default Blurry;
