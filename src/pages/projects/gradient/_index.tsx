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
import html2canvas from 'html2canvas';
import { random } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { z } from 'zod';

const formSchema = z.object({
  enableNoise: z.boolean(),
  noiseFrequency: z.number().min(0.3).max(1),
  opacity: z.number().min(0).max(1),
});

function Gradient() {
  const { t } = useTranslation();
  const { height, width } = useWindowSize();
  const [color, setColor] = useState<string>(randomColor().toHex());
  const [colorMode, setColorMode] = useState<'gradient' | 'solid'>('gradient');
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [imageFormat, setImageFormat] = useState('png');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [color1, color2, color3, rotate] = useMemo(() => {
    if (colorMode === 'solid') {
      return [colord(color), colord(color), colord(color), 0];
    }
    const color2 = colord(color).alpha(1).desaturate(random(0.1, 0.15)).lighten(random(0.1, 0.15));
    const color1 = color2.rotate(random(-50, -70)).saturate(random(0.15, 0.2)).lighten(random(0, 0.5));
    const color3 = color2.rotate(random(50, 70)).saturate(random(0.45, 0.55)).darken(random(0.1, 0.15));
    const rotate = random(0, 360, false);
    return [color1, color2, color3, rotate];
  }, [color, colorMode]);

  const form = useForm({
    defaultValues: {
      enableNoise: true,
      noiseFrequency: 0.65,
      opacity: 0.5,
    },
    resolver: zodResolver(formSchema),
  });
  const formValues = form.watch();

  const handleExportImage = () => {
    const element = document.createElement('div');
    element.style.width = `${imageWidth}px`;
    element.style.height = `${imageHeight}px`;
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.overflow = 'hidden';

    if (imageFormat === 'svg') {
      const filterContent = `
        <filter id="noise" x="0" y="0">
          <feTurbulence type="fractalNoise" baseFrequency="${formValues.noiseFrequency}" numOctaves="3" stitchTiles="stitch" />
          <feBlend mode="normal" />
        </filter>
      `;
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">
          <defs>
            <linearGradient id="lineGradient" gradientTransform="rotate(${rotate})">
              <stop offset="0%" stop-color="${color1.toHex()}" />
              <stop offset="50%" stop-color="${color2.toHex()}" />
              <stop offset="100%" stop-color="${color3.toHex()}" />
            </linearGradient>
            ${formValues.enableNoise ? filterContent : ''}
          </defs>
          <rect x="0" y="0" width="${imageWidth}" height="${imageHeight}" fill="url(#lineGradient)" />
          ${formValues.enableNoise ? `<rect width="${imageWidth}" height="${imageHeight}" x="0" y="0" filter="url(#noise)" opacity="${formValues.opacity}" />` : ''}
        </svg>
      `;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'gradient.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
    else {
      const gradientSvg = document.createElement('div');
      gradientSvg.style.width = '100%';
      gradientSvg.style.height = '100%';
      gradientSvg.style.position = 'absolute';
      gradientSvg.style.backgroundImage = `linear-gradient(${rotate}deg, ${color1.toHex()}, ${color2.toHex()}, ${color3.toHex()})`;

      const noiseSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      noiseSvg.setAttribute('width', '100%');
      noiseSvg.setAttribute('height', '100%');
      noiseSvg.style.position = 'absolute';
      noiseSvg.style.opacity = formValues.enableNoise ? formValues.opacity.toString() : '0';
      noiseSvg.innerHTML = `
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="${formValues.noiseFrequency}" numOctaves="3" stitchTiles="stitch" />
            <feBlend mode="normal" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#noise)" />
      `;

      element.appendChild(gradientSvg);
      element.appendChild(noiseSvg);
      document.body.appendChild(element);

      html2canvas(element, {
        backgroundColor: null,
        scale: 2, // 提高导出图片质量
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL(`image/${imageFormat}`, 1.0);
        link.download = `gradient.${imageFormat}`;
        link.click();
        document.body.removeChild(element);
      });
    }
  };

  return (
    <div
      className="w-sceen h-screen flex pb-24 flex-col items-center justify-center relative gap-10"
      data-vaul-drawer-wrapper
    >
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <HelpDrawer namespace="gradient" />
        <LanguageSwitch />
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className="absolute z-0 left-0 top-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" gradientTransform={`rotate(${rotate})`}>
            <stop offset="0%" stopColor={color1.toHex()} />
            <stop offset="50%" stopColor={color2.toHex()} />
            <stop offset="100%" stopColor={color3.toHex()} />
          </linearGradient>
          <filter id="noise" x="0" y="0">
            <feTurbulence type="fractalNoise" baseFrequency={formValues.noiseFrequency} numOctaves="3" stitchTiles="stitch" />
            <feBlend mode="normal" />
          </filter>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="url(#lineGradient)" />
        {formValues.enableNoise && <rect width={width} height={height} x="0" y="0" filter="url(#noise)" opacity={formValues.opacity} />}
      </svg>
      <Toaster position="bottom-right" />
      <div className="w-full px-8 max-w-[800px] flex items-center gap-4 bg-white/20 backdrop-blur-xl h-20 rounded-3xl shadow-md relative z-10">
        <Popover>
          <PopoverTrigger>
            <div className="size-6 rounded-md cursor-pointer ring-offset-2 transition-all duration-200 hover:ring-2 hover:ring-white/50" style={{ background: color }} />
          </PopoverTrigger>
          <PopoverContent className="flex justify-center p-0 w-auto border-0 shadow-none" side="top" sideOffset={12}>
            <Chrome
              color={color}
              onChange={e => setColor(e.hex)}
              /* @ts-expect-error ignore */
              placement="B"
              showEditableInput={false}
            />
          </PopoverContent>
        </Popover>
        <input
          value={color}
          onChange={e => setColor(e.target.value)}
          className="flex-grow h-11 text-2xl bg-transparent border-none focus:outline-none focus:ring-0"
        />
        <RainbowButton onClick={() => setColor(randomColor().toHex())}>RANDOM</RainbowButton>
      </div>
      <div className="w-full p-8 max-w-[800px] flex flex-col gap-4 bg-white/20 backdrop-blur-xl rounded-xl shadow-md z-10">
        <Form {...form}>
          <form>
            <div className="flex gap-4 items-center h-8">
              <Label className="w-40">
                {t('gradient.gradientType')}
                ：
              </Label>
              <RadioGroup
                value={colorMode}
                onValueChange={value => setColorMode(value as 'gradient' | 'solid')}
                className="flex gap-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solid" id="solid" />
                  <Label htmlFor="solid">{t('gradient.solid')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gradient" id="gradient" />
                  <Label htmlFor="gradient">{t('gradient.gradient')}</Label>
                </div>
              </RadioGroup>
            </div>
            <FormField
              name="enableNoise"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex gap-4 items-center h-8 m-0">
                  <FormLabel className="w-40">
                    {t('gradient.enableNoise')}
                    ：
                  </FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="!mt-0" />
                  </FormControl>
                </FormItem>
              )}
            />
            {formValues.enableNoise && (
              <>
                <FormField
                  name="noiseFrequency"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-4 items-center h-8 m-0">
                      <FormLabel className="w-40">
                        {t('gradient.noiseFrequency')}
                        ：
                      </FormLabel>
                      <FormControl className="w-72">
                        <div className="flex gap-3 items-center !mt-0">
                          <Slider
                            value={[field.value]}
                            min={0.3}
                            max={1}
                            step={0.05}
                            onValueChange={value => field.onChange(value[0])}
                          />
                          <span className="w-16"><NumberFlow value={field.value} /></span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="opacity"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-4 items-center h-8 m-0">
                      <FormLabel className="w-40">
                        {t('gradient.opacity')}
                        ：
                      </FormLabel>
                      <FormControl className="w-72">
                        <div className="flex gap-3 items-center !mt-0">
                          <Slider
                            value={[field.value]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={value => field.onChange(value[0])}
                          />
                          <span className="w-16"><NumberFlow value={field.value} /></span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
        <Card className="bg-white/40">
          <CardHeader>
            <CardTitle className="text-sm">{t('gradient.exportImageSettings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs pl-3">{t('gradient.presetSize')}</Label>
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
                <Label className="text-xs pl-3">{t('gradient.exportFormat')}</Label>
                <Select value={imageFormat} onValueChange={setImageFormat}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WEBP</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs pl-3">{t('gradient.width')}</Label>
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
                <Label className="text-xs pl-3">{t('gradient.height')}</Label>
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
                {t('gradient.exportImage')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Gradient;
