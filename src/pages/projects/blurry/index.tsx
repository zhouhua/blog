import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Popover, PopoverContent } from '@react/ui/popover';
import { RadioGroup, RadioGroupItem } from '@react/ui/radio-group';
import { RainbowButton } from '@react/ui/rainbow-button';
import { Slider } from '@react/ui/slider';
import { Chrome } from '@uiw/react-color';
import { random as randomColor } from 'colord';
import { random } from 'lodash-es';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWindowSize } from 'react-use';
import { z } from 'zod';

const formSchema = z.object({
  background: z.string(),
  blur: z.number().min(0.2).max(2),
  colors: z.array(z.string()).length(2),
  num: z.number().min(2).max(10),
  type: z.enum(['type 1', 'type 2']),
  zoom: z.number().min(0.2).max(5),
});

function Blurry() {
  const { height, width } = useWindowSize();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      background: '#ffffff',
      blur: 1,
      colors: ['#fff', '#fff'],
      num: 5,
      type: 'type 1',
      zoom: 1,
    },
    resolver: zodResolver(formSchema),
  });
  const formValues = form.watch();
  const generateColors = () => {
    const color2 = randomColor();
    const color1 = color2.rotate(random(-50, -70)).saturate(random(0.15, 0.2)).lighten(random(0, 0.5));
    form.setValue('colors', [color1.toHex(), color2.toHex()]);
    form.setValue('background', form.getValues().type !== 'type 2' ? color1.toHex() : '#ffffffff');
    generate();
  };
  const [blurLength, setBlurLength] = useState(0);
  const [circles, setCircles] = useState<ReactNode[]>([]);
  function generate() {
    const length = Math.min(width, height);
    const blur = length / (formValues.type === 'type 1' ? 6 : 12);
    setBlurLength(random(blur * 0.9, blur * 1.1));
    const nodes: ReactNode[] = [];
    if (formValues.type === 'type 1') {
      for (let i = 0; i < formValues.num; i++) {
        nodes.push(
          <circle
            key={i}
            cx={random(width)}
            cy={random(height)}
            r={random(length * 0.95, length * 1.05) / 2 * formValues.zoom}
            fill={i % 2 ? formValues.colors[1] : formValues.colors[0]}
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
      const deltaX = Math.cos(angel);
      const deltaY = Math.sin(angel);
      nodes.push(
        <circle
          cx={x}
          cy={y}
          r={r1}
          fill={formValues.colors[0]}
        />,
      );
      nodes.push(
        <circle
          cx={x + deltaX * (r1 - r2)}
          cy={y + deltaY * (r1 - r2)}
          r={r2}
          fill={formValues.colors[1]}
        />,
      );
    }
    setCircles(nodes);
  }

  function setDefaultBg() {
    form.setValue('background', formValues.type !== 'type 2' ? form.getValues().colors[0]! : '#ffffffff');
  }

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
  return (
    <div
      className="w-sceen h-screen flex flex-col items-center justify-center relative gap-10"
      data-vaul-drawer-wrapper
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className="absolute z-0 left-0 top-0 w-full h-full">
        <defs>
          <filter id="blur" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="luminosity" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur
              stdDeviation={Math.floor(blurLength * formValues.blur)}
              result="effect1_foregroundBlur"
            />
          </filter>
        </defs>
        <g filter="url(#blur)">
          <rect x="0" y="0" width={width} height={height} fill={formValues.background} />
          {circles}
        </g>
      </svg>
      <div className="fixed right-24 top-24 w-80 z-10">
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
                      <FormLabel className="w-20  shrink-0">类型：</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center"
                        >
                          <FormItem className="flex items-center gap-4">
                            <FormControl>
                              <RadioGroupItem value="type 1" />
                            </FormControl>
                            <FormLabel className="font-normal !mt-0">
                              Type 1
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-4">
                            <FormControl>
                              <RadioGroupItem value="type 2" />
                            </FormControl>
                            <FormLabel className="font-normal !mt-0">
                              Type 2
                            </FormLabel>
                          </FormItem>
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
                {formValues.type !== 'type 2' && (
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
      </div>
    </div>
  );
}
export default Blurry;
