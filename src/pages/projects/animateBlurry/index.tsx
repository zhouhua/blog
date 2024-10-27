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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@react/ui/select';
import { Slider } from '@react/ui/slider';
import { Switch } from '@react/ui/switch';
import { Chrome } from '@uiw/react-color';
import { colord, extend, random as randomColor } from 'colord';
import harmoniesPlugin from 'colord/plugins/harmonies';
import { useForm } from 'react-hook-form';
import { useWindowSize } from 'react-use';
import { z } from 'zod';

extend([harmoniesPlugin]);
const blendModes = ['multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'] as const;
const formSchema = z.object({
  animate: z.boolean(),
  background: z.string(),
  blendMode: z.enum(blendModes),
  blur: z.number().min(1).max(20),
  colors: z.array(z.string()),
  interactive: z.boolean(),
  pointerColor: z.string(),
  size: z.number().min(0.1).max(1.2),
  // zoom: z.number().min(0.2).max(5),
});

function Blurry() {
  const { height, width } = useWindowSize();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      background: '#ffffff',
      blendMode: 'hard-light',
      blur: 10,
      colors: randomColor().harmonies('double-split-complementary').map(c => c.toHex()),
      interactive: true,
      pointerColor: randomColor().toHex(),
      size: 0.8,
      // zoom: 1,
    },
    resolver: zodResolver(formSchema),
  });
  const formValues = form.watch();
  function generateColors() {
    form.setValue('colors', randomColor().harmonies('double-split-complementary').map(c => c.toHex()));
    form.setValue('pointerColor', randomColor().toHex());
  }
  const circleSize = `${formValues.size * 100}%`;
  return (
    <div
      className="w-sceen h-screen flex flex-col items-center justify-center relative gap-10"
      data-vaul-drawer-wrapper
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="fixed w-full h-full left-0 top-0" width={width} height={height}>
        <defs>
          <filter id="point">
            <feGaussianBlur in="SourceGraphic" stdDeviation={formValues.blur} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="point"
            />
            <feBlend in="SourceGraphic" in2="point" />
            <feGaussianBlur stdDeviation="40" result="blur" />
          </filter>
          <feBlend mode={formValues.blendMode} id="blend" />
          {[...formValues.colors, ...formValues.colors].map((color, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <radialGradient key={`${color}${index}`} id={`color${index}`} cx="50%" cy="50%" r={circleSize} fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={colord(color).alpha(0.8).toHex()} />
              <stop offset="50%" stopColor={colord(color).alpha(0).toHex()} />
            </radialGradient>
          ))}
        </defs>
        <rect width="100%" height="100%" fill={formValues.background} />
        <g filter="url(#point)">
          <circle filter="url(#blend)" fill="url(#color0)" r={circleSize} cx="50%" cy="50%" transform-origin="50% 50%">
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle filter="url(#blend)" fill="url(#color1)" r={circleSize} cx="50%" cy="50%" transform-origin={[width / 2 - 400, height / 2 - 400].join(' ')}>
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle filter="url(#blend)" fill="url(#color2)" r={circleSize} cx="50%" cy="50%" transform-origin={[width / 2 + 400, height / 2 + 400].join(' ')}>
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="40s" repeatCount="indefinite" />
          </circle>
          <circle filter="url(#blend)" fill="url(#color3)" r={circleSize} cx="50%" cy="50%" transform-origin={[width / 2 - 200, height / 2 - 200].join(' ')} opacity={0.7}>
            <animateTransform attributeName="transform" type="translate" keyTimes="0; 0.5; 1" values={`-${width * formValues.size * 0.5} -${height * formValues.size * 0.1}; ${width * formValues.size * 0.5} ${height * formValues.size * 0.1}; -${width * formValues.size * 0.5} -${height * formValues.size * 0.1}`} dur="40s" repeatCount="indefinite" />
          </circle>
          <circle filter="url(#blend)" fill="url(#color4)" r={circleSize} cx="50%" cy="50%" transform-origin={[width / 2 - 800, height / 2 + 200].join(' ')}>
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
      <div className="fixed right-24 top-24 w-[400px] z-10">
        <Card className="bg-white/40">
          <CardHeader>
            <CardTitle>动态模糊背景生成</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form>
                <FormField
                  name="interactive"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">交互：</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                          max={20}
                          step={1}
                          min={1}
                          value={[field.value]}
                          onValueChange={e => field.onChange(e[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* <FormField
                  name="zoom"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">光点大小：</FormLabel>
                      <FormControl>
                        <Slider
                          className="flex-shrink"
                          max={3}
                          step={0.1}
                          min={0.2}
                          value={[field.value]}
                          onValueChange={e => field.onChange(e[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                /> */}
                <FormField
                  name="size"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 items-center h-12">
                      <FormLabel className="w-20  shrink-0">光点大小：</FormLabel>
                      <FormControl>
                        <Slider
                          className="flex-shrink"
                          max={1.2}
                          step={0.01}
                          min={0.1}
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {blendModes.map(key => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          generateColors();
                          e.preventDefault();
                        }}
                      >
                        随机颜色
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
                {formValues.interactive && (
                  <FormField
                    name="pointerColor"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex gap-1 items-center h-12">
                        <FormLabel className="w-20  shrink-0">焦点颜色：</FormLabel>
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
                )}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Blurry;
