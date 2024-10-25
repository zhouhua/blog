import { cn } from '@lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@react/ui/card';
import { Label } from '@react/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@react/ui/popover';
import { RadioGroup, RadioGroupItem } from '@react/ui/radio-group';
import { Slider } from '@react/ui/slider';
import { Chrome } from '@uiw/react-color';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import { random } from 'lodash-es';
import { useMemo, useState } from 'react';
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

// const group: Record<string, string[][]> = {};

// collections.forEach(({ colors }) => {
//   const key = colord(colors[0]).toName({ closest: true })!;
//   if (group[key]) {
//     group[key].push(colors);
//   }
//   else {
//     group[key] = [colors];
//   }
// });

// console.log(group);

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
  const gradientString = useMemo(() => {
    return generateGradientString({
      colors,
      rotate,
      type,
    });
  }, [type, rotate, colors]);
  return (
    <div className="w-screen h-screen" style={{ backgroundImage: gradientString }}>
      <div className="fixed right-12 top-12 w-80">
        <List
          title={`渐变效果（共 ${collections.length} 个）`}
          description="点击列表可以预览并微调"
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
        <Card className="mt-6 bg-white/40">
          <CardHeader>
            <CardTitle>渐变设置</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
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
                  // eslint-disable-next-line react/no-array-index-key
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
      </div>
    </div>
  );
}
export default Gradient;
