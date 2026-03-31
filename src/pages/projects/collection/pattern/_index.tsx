import type { IPattern } from './collection';
import { cn } from '@lib/utils';
import NumberFlow from '@number-flow/react';
import { HelpDrawer } from '@react/components/HelpDrawer';
import { LanguageSwitch } from '@react/components/LanguageSwitch';
import { Button } from '@react/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@react/ui/card';
import { Label } from '@react/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@react/ui/popover';
import { RadioGroup, RadioGroupItem } from '@react/ui/radio-group';
import { Slider } from '@react/ui/slider';
import { Toaster } from '@react/ui/sonner';
import { Chrome } from '@uiw/react-color';
import { colord, extend } from 'colord';
import minifyPlugin from 'colord/plugins/minify';
import namesPlugin from 'colord/plugins/names';
import { last } from 'es-toolkit/array';
import { random } from 'es-toolkit/math';
import { pick } from 'es-toolkit/object';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

import parse from 'style-to-js';
import List from '../_List';
import collections, { groups } from './collection';

extend([namesPlugin, minifyPlugin]);

const CSS_DECLARATION_RE = /;\s*/g;
// eslint-disable-next-line unicorn/better-regex
const CSS_BLOCK_START_RE = /\s*\{\s*/g;
// eslint-disable-next-line unicorn/better-regex
const CSS_BLOCK_END_RE = /\s*\}\s*/g;
const CSS_COMMA_RE = /,\s*/g;
const CSS_COLON_RE = /:\s*/g;
const CSS_TRAILING_SEMICOLON_RE = /\s*;\s*$/g;
const SVG_ID_RE = /id="(.+?)"/gi;
const SVG_URL_RE = /\(#(.+?)\)/g;
const SVG_HREF_RE = /href="#(.+?)"/g;

function createSvgDataUrl(svgString: string) {
  return `data:image/svg+xml;base64,${window.btoa(svgString)}`;
}

function Pattern() {
  const { t } = useTranslation();
  const hasPatterns = collections.length > 0;
  const initialPattern: IPattern | null = hasPatterns
    ? collections[
      Math.min(
        Math.max(0, random(0, collections.length - 1)),
        collections.length - 1,
      )
    ] ?? collections[0]!
    : null;

  const [pickedItem, setPickedItem] = useState<IPattern | null>(initialPattern);
  const [colors, setColors] = useState<string[]>(
    initialPattern ? initialPattern.colors : ['#000000', '#ffffff'],
  );
  const [rotate, setRotate] = useState(initialPattern?.rotate ?? 0);
  const [zoom, setZoom] = useState(initialPattern?.zoom ?? 1);
  const [gradient, setGradient] = useState<'0' | '1' | '2'>('0');
  const [translateX, setTranslateX] = useState(initialPattern?.translate?.[0] ?? 0);
  const [translateY, setTranslateY] = useState(initialPattern?.translate?.[1] ?? 0);
  const [stroke, setStroke] = useState(initialPattern?.stroke ?? 1);
  const mask = useMemo(() => {
    if (gradient === '0') {
      return 'none';
    }
    const [start, end] = [gradient === '1' ? '#00000000 50%' : '#0000009e 0%', gradient === '1' ? '#0000009e 100%' : '#00000000 50%'];
    return `radial-gradient(circle at 50% 50%, ${start}, ${end})`;
  }, [gradient]);

  const cssCode = useMemo(() => {
    const props = {
      colors,
      rotate,
      stroke,
      translate: [translateX, translateY] as [number, number],
      zoom,
    };

    if (!pickedItem)
      return '';

    if (pickedItem.type === 'svg') {
      const svgString = pickedItem.render(props);
      const dataUrl = `data:image/svg+xml;base64,${window.btoa(svgString)}`;
      return [
        'background-color: transparent;',
        `background-image: url('${dataUrl}');`,
        'background-repeat: repeat;',
      ].filter(Boolean).join('\n');
    }
    else {
      const rawCss = pickedItem.render(props);
      const formattedCss = rawCss
        .replace(CSS_DECLARATION_RE, ';\n  ')
        .replace(CSS_BLOCK_START_RE, ' {\n  ')
        .replace(CSS_BLOCK_END_RE, '\n}\n')
        .replace(CSS_COMMA_RE, ',\n    ')
        .replace(CSS_COLON_RE, ': ')
        .replace(CSS_TRAILING_SEMICOLON_RE, ';')
        .trim();

      return [
        formattedCss,
      ].filter(Boolean).join('\n');
    }
  }, [pickedItem, colors, rotate, stroke, translateX, translateY, zoom]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    toast.success(t('common.copied'));
  };

  const patternProps = {
    colors,
    rotate,
    stroke,
    translate: [translateX, translateY] as [number, number],
    zoom,
  };

  const svgMarkup = pickedItem && pickedItem.type === 'svg'
    ? pickedItem.render(pick(patternProps, ['colors', 'rotate', 'stroke', 'translate', 'zoom'] as const))
    : null;
  const svgBackgroundImage = svgMarkup ? `url("${createSvgDataUrl(svgMarkup)}")` : undefined;
  const cssBackgroundStyle = pickedItem && pickedItem.type === 'css'
    ? parse(`${pickedItem.render(pick(patternProps, ['colors', 'rotate', 'stroke', 'translate', 'zoom'] as const))}mask-image:${mask}`) ?? undefined
    : undefined;

  return (
    <div className="w-screen h-screen" style={{ background: last(colors) }}>
      <Toaster position="bottom-right" />
      <div className="fixed top-9 right-9 flex gap-2 z-50">
        <HelpDrawer namespace="pattern" />
        <LanguageSwitch />
      </div>
      {pickedItem?.type === 'svg' && (
        <div
          className="fixed left-0 top-0 h-full w-full"
          style={{
            backgroundImage: svgBackgroundImage,
            backgroundRepeat: 'repeat',
            maskImage: mask,
          }}
        />
      )}
      {pickedItem?.type === 'css' && (
        <div
          className="fixed left-0 top-0 h-full w-full"
          style={cssBackgroundStyle}
        />
      )}
      <div className="fixed right-6 top-6 bottom-[64px] w-[400px] z-10 flex flex-col gap-4 flex-wrap-reverse">
        <List
          className="bg-white w-full"
          title={`${t('pattern.patternList')} ${t('pattern.totalCount', { count: collections.length })}`}
          description={t('pattern.patternListDescription')}
          data={collections}
          filterFields={['type', ['group', groups]]}
          renderItem={(item: IPattern, index) => {
            return (

              <div
                key={item.type + item.group + index}
                className={cn(
                  'size-20 shadow-md rounded cursor-pointer ring-offset-2 transition-all duration-200 overflow-hidden',
                  {
                    'hover:ring-[#444cf7]/50 hover:ring-2': item !== pickedItem,
                    'ring-2 ': item === pickedItem,
                  },
                )}
                style={item.type === 'svg'
                  ? {
                      backgroundImage: `url("${createSvgDataUrl(
                        item.render(pick({ ...item, zoom: 0.2 }, ['colors', 'rotate', 'stroke', 'translate', 'zoom'] as const))
                          .replace(SVG_ID_RE, `id="$1saltsalt${index}"`)
                          .replace(SVG_URL_RE, `(#$1saltsalt${index})`)
                          .replace(SVG_HREF_RE, `href="#$1saltsalt${index}"`),
                      )}")`,
                      backgroundRepeat: 'repeat',
                    }
                  : parse(item.render(pick({ ...item, zoom: 0.2 }, ['colors', 'rotate', 'translate', 'zoom'] as const))) ?? undefined}
                onClick={() => {
                  setPickedItem(item);
                  setColors(item.colors);
                  'stroke' in item && setStroke(item.stroke);
                  'rotate' in item && setRotate(item.rotate);
                  setZoom(1);
                  setTranslateX(0);
                  setTranslateY(0);
                }}
              />
            );
          }}
        />

        <Card className="bg-white w-full">
          <CardHeader>
            <CardTitle className="text-sm">{t('pattern.patternSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pickedItem?.type === 'svg' && !pickedItem?.disabled?.includes('rotate') && (
              <div className="flex gap-2 items-center">
                <Label className="w-[70px] text-xs">
                  {t('pattern.rotate')}
                  ：
                </Label>
                <Slider
                  className="flex-1"
                  value={[rotate]}
                  min={0}
                  max={360}
                  step={5}
                  onValueChange={value => setRotate(value[0]!)}
                />
                <span className="w-8 text-right text-sm">
                  <NumberFlow value={rotate} suffix="°" />
                </span>
              </div>
            )}

            {!pickedItem?.disabled?.includes('zoom') && (
              <div className="flex gap-2 items-center">
                <Label className="w-[70px] text-xs">
                  {t('pattern.zoom')}
                  ：
                </Label>
                <Slider
                  className="flex-1"
                  value={[zoom]}
                  min={0.2}
                  max={10}
                  step={0.1}
                  onValueChange={value => setZoom(value[0]!)}
                />
                <span className="w-8 text-right text-sm">
                  <NumberFlow value={zoom} suffix="x" />
                </span>
              </div>
            )}
            {!pickedItem?.disabled?.includes('translate') && (
              <div className="flex gap-2 items-center">
                <Label className="w-[70px] text-xs">
                  {t('pattern.horizontalOffset')}
                  ：
                </Label>
                <Slider
                  className="flex-1"
                  value={[translateX]}
                  min={-100}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setTranslateX(value[0]!);
                  }}
                />
                <span className="w-8 text-right text-sm">
                  <NumberFlow value={translateX} suffix="px" />
                </span>
              </div>
            )}
            {!pickedItem?.disabled?.includes('translate') && (
              <div className="flex gap-2 items-center">
                <Label className="w-[70px] text-xs">
                  {t('pattern.verticalOffset')}
                  ：
                </Label>
                <Slider
                  className="flex-1"
                  value={[translateY]}
                  min={-100}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setTranslateY(value[0]!);
                  }}
                />
                <span className="w-8 text-right text-sm">
                  <NumberFlow value={translateY} suffix="px" />
                </span>
              </div>
            )}
            {pickedItem?.type === 'svg' && !pickedItem?.disabled?.includes('stroke') && (
              <div className="flex gap-2 items-center">
                <Label className="w-[70px] text-xs">
                  {t('pattern.strokeWidth')}
                  ：
                </Label>
                <Slider
                  className="flex-1"
                  value={[stroke]}
                  min={1}
                  max={60}
                  step={1}
                  onValueChange={value => setStroke(value[0]!)}
                />
                <span className="w-8 text-right text-sm">
                  <NumberFlow value={stroke} suffix="px" />
                </span>
              </div>
            )}
            {pickedItem && !pickedItem.disabled?.includes('colors') && (
              <div className="flex gap-2 items-center">
                <Label className="w-[70px] text-xs">
                  {t('pattern.adjustColors')}
                  ：
                </Label>
                <div
                  className="flex gap-2"
                >
                  {pickedItem.colors.map((_, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Popover key={index}>
                      <PopoverTrigger>
                        <div
                          className={cn(
                            'h-6 rounded-md shadow-sm cursor-pointer flex-1 text-sm px-2 leading-6 font-mono',
                            colord(colors[index]!).isDark() ? 'text-white/80' : 'text-black/80',
                          )}
                          style={{ backgroundColor: colors[index]! }}
                        >
                          {colord(colors[index]!).minify({
                            hsl: false,
                            name: true,
                          })}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="flex justify-center p-0 w-auto border-0 shadow-none" side="top" sideOffset={12} asChild>
                        <Chrome
                          color={colors[index]!}
                          onChange={e =>
                            setColors(colors.map((c, i) => (i === index
                              ? (colord(e.rgba).alpha() === 1 ? e.hex : e.hexa)
                              : c)) as [string, ...string[]])}
                          /* @ts-expect-error ignore */
                          placement="B"
                          showEditableInput={false}
                        />
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <Label className="w-[70px] text-xs">
                {t('pattern.gradient')}
                ：
              </Label>
              <RadioGroup
                value={gradient}
                onValueChange={t => setGradient(t as '0' | '1' | '2')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="o0" />
                  <Label htmlFor="o0" className="text-xs">
                    {t('pattern.none')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="o1" />
                  <Label htmlFor="o1" className="text-xs">
                    {t('pattern.centerTransparent')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="o2" />
                  <Label htmlFor="o2" className="text-xs">
                    {t('pattern.edgeTransparent')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white w-full">
          <CardHeader>
            <CardTitle className="text-sm">{t('pattern.exportCSS')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SyntaxHighlighter language="css" style={oneLight} className="text-xs font-monospace max-h-28 w-full overflow-auto">
              {cssCode}
            </SyntaxHighlighter>
            <Button onClick={handleCopy}>
              {t('pattern.copyToClipboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Pattern;
