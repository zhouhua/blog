import { zodResolver } from '@hookform/resolvers/zod';
import { sizeOptions } from '@lib/projects';
import NumberFlow from '@number-flow/react';
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
import { Switch } from '@react/ui/switch';
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
  enableNoise: z.boolean(),
  num: z.number().min(2).max(10),
  type: z.enum(['type1', 'type2']),
  zoom: z.number().min(0.2).max(5),
});

const TYPE_LABELS: Record<z.infer<typeof formSchema>['type'], string> = {
  type1: 'blurry.merge',
  type2: 'blurry.interlace',
} as const;

// 添加一个新的 interface 来保存随机参数
interface GenerationParams {
  positions: { x: number; y: number; radius: number }[];
  blurAmount: number;
  angle?: number;
  deltaX?: number;
  deltaY?: number;
  r1?: number;
  r2?: number;
}

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
      enableNoise: false,
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
  const formEnableNoise = form.watch('enableNoise');
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [imageFormat, setImageFormat] = useState('png');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  // 添加一个状态来保存当前渲染的参数
  const [currentParams, setCurrentParams] = useState<GenerationParams | null>(null);

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
  // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-callback
  const drawCircle = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
  ) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const c = colord(color);

    gradient.addColorStop(0, color);
    gradient.addColorStop(0.8, color);
    gradient.addColorStop(1, c.alpha(0).toRgbString());

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // 修改 renderToContext 函数，接收并返回生成参数
  const renderToContext = useCallback((
    ctx: CanvasRenderingContext2D,
    targetWidth: number,
    targetHeight: number,
    params?: GenerationParams,
    options?: { skipBackground?: boolean },
  ): GenerationParams => {
    if (!offscreenCanvasRef.current)
      return params || { blurAmount: 0, positions: [] };

    const offscreenCtx = offscreenCanvasRef.current.getContext('2d')!;
    const length = Math.min(targetWidth, targetHeight);
    const blur = length / (formType === 'type1' ? 8 : 12);

    // 使用传入的参数或生成新的参数
    const generationParams = params || {
      blurAmount: random(blur * 0.9, blur * 1.1),
      positions: [],
      ...(formType === 'type2' && {
        angle: random(0, Math.PI * 2),
        r1: random(length * 0.95, length * 1.05) / 4.5 * formZoom,
        r2: random(length * 0.95, length * 1.05) / 5 * formZoom,
      }),
    };

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
      // 如果没有传入参数，生成新的位置
      if (!params) {
        generationParams.positions = Array.from({ length: actualNum }, () => ({
          radius: random(length * 1.2, length * 1.4) / 2 * formZoom,
          x: random(targetWidth),
          y: random(targetHeight),
        }));
      }

      // 使用保存的位置参数绘制
      generationParams.positions.forEach((pos, i) => {
        drawCircle(offscreenCtx, pos.x, pos.y, pos.radius, formColors[i % 2]!);
      });
    }
    else {
      const { angle, r1, r2 } = generationParams;
      const x = targetWidth / 2;
      const y = targetHeight / 2;
      const deltaX = Math.cos(angle!) * r1! * 0.8;
      const deltaY = Math.sin(angle!) * r1! * 0.8;

      drawCircle(offscreenCtx, x, y, r1!, formColors[0]!);
      drawCircle(offscreenCtx, x + deltaX, y + deltaY, r2!, formColors[1]!);
    }

    // 应用模糊效果
    blurCtx.filter = `blur(${Math.floor(generationParams.blurAmount * formBlur)}px)`;
    blurCtx.drawImage(offscreenCanvasRef.current, 0, 0);

    // 将模糊后的图像绘制到主画布
    ctx.drawImage(blurCanvas, 0, 0);

    return generationParams;
  }, [formType, formBackground, formColors, formNum, formZoom, formBlur, drawCircle]);

  // 修改 generate 函数，保存生成的参数
  const generate = useCallback(() => {
    if (!canvasRef.current)
      return;
    const ctx = canvasRef.current.getContext('2d')!;
    const params = renderToContext(ctx, width, height);
    setCurrentParams(params);
  }, [width, height, renderToContext]);

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

  // 修改导出函数，使用保存的参数
  const handleExportImage = () => {
    if (!canvasRef.current || !currentParams)
      return;

    const exportCanvas = document.createElement('canvas');
    const finalCanvas = document.createElement('canvas');
    // 设置 2x 尺寸用于渲染
    exportCanvas.width = imageWidth * 2;
    exportCanvas.height = imageHeight * 2;
    // 最终输出尺寸
    finalCanvas.width = imageWidth;
    finalCanvas.height = imageHeight;

    const exportCtx = exportCanvas.getContext('2d')!;
    const finalCtx = finalCanvas.getContext('2d')!;

    // 使用保存的参数重新渲染，但需要调整参数以适应新的尺寸
    const scaleX = imageWidth * 2 / width;
    const scaleY = imageHeight * 2 / height;
    const scaledParams = {
      ...currentParams,
      blurAmount: currentParams.blurAmount * scaleX,
      positions: currentParams.positions.map(pos => ({
        radius: pos.radius * scaleX,
        x: pos.x * scaleX,
        y: pos.y * scaleY,
      })),
    };

    if (currentParams.r1) {
      scaledParams.r1 = currentParams.r1 * scaleX;
      scaledParams.r2 = currentParams.r2! * scaleX;
    }

    renderToContext(exportCtx, imageWidth * 2, imageHeight * 2, scaledParams);

    // 如果启用了噪点，添加噪点图层
    if (formEnableNoise) {
      try {
        // 创建一个临时的 SVG 字符串，使用 2x 尺寸
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth * 2}" height="${imageHeight * 2}">
            <defs>
              <filter id="noise" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.325" numOctaves="3" stitchTiles="stitch" />
                <feBlend mode="screen" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#noise)" opacity="0.5" />
          </svg>
        `.trim();

        const img = new Image();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
          try {
            exportCtx.drawImage(img, 0, 0, imageWidth * 2, imageHeight * 2);

            // 使用高质量的图像缩放
            finalCtx.imageSmoothingEnabled = true;
            finalCtx.imageSmoothingQuality = 'high';
            finalCtx.drawImage(exportCanvas, 0, 0, imageWidth, imageHeight);

            const link = document.createElement('a');
            link.href = finalCanvas.toDataURL(`image/${imageFormat}`, imageFormat === 'jpeg' ? 0.92 : undefined);
            link.download = `blurry.${imageFormat}`;
            link.click();
            toast.success(t('blurry.exportSuccess'));
          }
          catch (error) {
            console.error('Error during export:', error);
            toast.error(t('blurry.exportError'));
          }
          finally {
            URL.revokeObjectURL(url);
          }
        };

        img.onerror = () => {
          console.error('Error loading noise texture');
          toast.error(t('blurry.exportError'));
          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
      catch (error) {
        console.error('Error creating noise texture:', error);
        // 如果噪点生成失败，至少导出没有噪点的图片
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(exportCanvas, 0, 0, imageWidth, imageHeight);

        const link = document.createElement('a');
        link.href = finalCanvas.toDataURL(`image/${imageFormat}`, imageFormat === 'jpeg' ? 0.92 : undefined);
        link.download = `blurry.${imageFormat}`;
        link.click();
        toast.error(t('blurry.noiseError'));
      }
    }
    else {
      // 如果没有启用噪点，直接导出
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(exportCanvas, 0, 0, imageWidth, imageHeight);

      const link = document.createElement('a');
      link.href = finalCanvas.toDataURL(`image/${imageFormat}`, imageFormat === 'jpeg' ? 0.92 : undefined);
      link.download = `blurry.${imageFormat}`;
      link.click();
      toast.success(t('blurry.exportSuccess'));
    }
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
          className="w-full h-full grow shrink rounded-md overflow-hidden relative shadow-md"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />

          {formEnableNoise && (
            <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className="absolute z-0 left-0 top-0 w-full h-full">
              <filter id="noise" x="0" y="0">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                <feBlend mode="screen" />
              </filter>
              <rect width={width} height={height} filter="url(#noise)" opacity="0.5" />
            </svg>
          )}
        </div>

        <div className="flex flex-col gap-2 bottom-16">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm">{t('blurry.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form>
                  <FormField
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex gap-1 items-center h-10">
                        <FormLabel className="w-24  shrink-0">
                          {t('blurry.effectType')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4 mt-0!"
                          >
                            {(Object.entries(TYPE_LABELS) as [z.infer<typeof formSchema>['type'], string][]).map(([value, label]) => (
                              <FormItem key={value} className="flex items-center gap-2">
                                <FormControl>
                                  <RadioGroupItem value={value} />
                                </FormControl>
                                <FormLabel className="font-normal mt-0!">
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
                        <FormLabel className="w-24  shrink-0">
                          {t('blurry.blurLevel')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2 w-full items-center mt-0!">
                            <Slider
                              max={2}
                              step={0.1}
                              min={0.2}
                              value={[field.value]}
                              onValueChange={e => field.onChange(e[0])}
                            />
                            <span className="w-10 text-right"><NumberFlow value={field.value} /></span>
                          </div>
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
                          <FormLabel className="w-24  shrink-0">
                            {t('blurry.dotsNumber')}
                            ：
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2 w-full items-center mt-0!">
                              <Slider
                                className="relative flex items-center w-full h-5 touch-none select-none mt-0!"
                                max={10}
                                step={1}
                                min={2}
                                value={[field.value]}
                                onValueChange={e => field.onChange(e[0])}
                              />
                              <span className="w-10 text-right"><NumberFlow value={field.value} /></span>
                            </div>
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
                        <FormLabel className="w-24  shrink-0">
                          {t('blurry.dotsSize')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2 w-full items-center mt-0!">
                            <Slider
                              className="shrink mt-0!"
                              max={5}
                              step={0.1}
                              min={0.2}
                              value={[field.value]}
                              onValueChange={e => field.onChange(e[0])}
                            />
                            <span className="w-10 text-right"><NumberFlow value={field.value} suffix="x" /></span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="enableNoise"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex gap-1 items-center h-10">
                        <FormLabel className="w-24  shrink-0">
                          {t('blurry.enableNoise')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0!"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormItem className="flex gap-1 items-center h-10">
                    <FormLabel className="w-24  shrink-0">
                      {t('blurry.adjustColors')}
                      ：
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center justify-between w-full mt-0!">
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
                      <FormItem className="flex gap-1 items-center h-10">
                        <FormLabel className="w-24  shrink-0">
                          {t('blurry.backgroundColor')}
                          ：
                        </FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="size-8 rounded-md shadow-md mt-0!" style={{ background: field.value }} />
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
              <CardTitle className="text-sm">{t('blurry.exportImage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs pl-3">{t('blurry.presetSize')}</Label>
                  <Select
                    value={selectedPreset}
                    onValueChange={(value) => {
                      setSelectedPreset(value);
                      const selectedSize = sizeOptions.find(option => option.labelKey === value);
                      if (selectedSize) {
                        setImageWidth(selectedSize.width);
                        setImageHeight(selectedSize.height);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t('size.selectSize')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(sizeOptions.map(option => option.category))).map(category => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {t(category)}
                          </div>
                          {sizeOptions
                            .filter(option => option.category === category)
                            .map(option => (
                              <SelectItem key={option.labelKey} value={option.labelKey}>
                                {t(option.labelKey)}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs pl-3">{t('blurry.exportFormat')}</Label>
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
                  <Label className="text-xs pl-3">{t('blurry.width')}</Label>
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
                  <Label className="text-xs pl-3">{t('blurry.height')}</Label>
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
