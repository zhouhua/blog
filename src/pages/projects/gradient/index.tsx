import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverTrigger } from '@radix-ui/react-popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@react/ui/form';
import { Popover, PopoverContent } from '@react/ui/popover';
import { RainbowButton } from '@react/ui/rainbow-button';
import { Slider } from '@react/ui/slider';
import { Switch } from '@react/ui/switch';
import { Chrome } from '@uiw/react-color';
import { colord, random as randomColor } from 'colord';
import { random } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWindowSize } from 'react-use';
import { z } from 'zod';

const formSchema = z.object({
  enableNoise: z.boolean(),
  noiseFrequency: z.number().min(0.3).max(1),
  opacity: z.number().min(0).max(1),
});

function Gradient() {
  const { height, width } = useWindowSize();
  const [color, setColor] = useState<string>(randomColor().toHex());
  const [color1, color2, color3, rotate] = useMemo(() => {
    const color2 = colord(color).alpha(1).desaturate(random(0.1, 0.15)).lighten(random(0.1, 0.15));
    const color1 = color2.rotate(random(-50, -70)).saturate(random(0.15, 0.2)).lighten(random(0, 0.5));
    const color3 = color2.rotate(random(50, 70)).saturate(random(0.45, 0.55)).darken(random(0.1, 0.15));
    const rotate = random(0, 360, false);
    return [color1, color2, color3, rotate];
  }, [color]);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      enableNoise: true,
      noiseFrequency: 0.65,
      opacity: 0.5,
    },
    resolver: zodResolver(formSchema),
  });
  const formValues = form.watch();
  return (
    <div
      className="w-sceen h-screen flex flex-col items-center justify-center relative gap-10"
      data-vaul-drawer-wrapper
    >
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
      <div className="w-full px-8 max-w-[800px] flex items-center gap-4 bg-white h-20 rounded-3xl shadow-md relative z-10">
        <Popover>
          <PopoverTrigger>
            <div className="size-6 rounded-md" style={{ background: color }} />
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
          className="flex-grow h-11 text-2xl"
        />
        <RainbowButton onClick={() => setColor(randomColor().toHex())}>RANDOM</RainbowButton>
      </div>
      <div className="w-full p-8 max-w-[800px] flex flex-row items-center gap-4 bg-white rounded-xl shadow-md z-10">
        <Form {...form}>
          <form>
            <FormField
              name="enableNoise"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex gap-4 items-center h-12">
                  <FormLabel className="w-40">添加噪点：</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="noiseFrequency"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex gap-4 items-center h-12">
                  <FormLabel className="w-40">噪点数量：</FormLabel>
                  <FormControl className="w-72">
                    <div className="flex gap-3 items-center">
                      <Slider
                        value={[field.value]}
                        min={0.3}
                        max={1}
                        step={0.05}
                        onValueChange={value => field.onChange(value[0])}
                      />
                      <span className="w-16">{field.value}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="opacity"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex gap-4 items-center h-12">
                  <FormLabel className="w-40">噪点强度：</FormLabel>
                  <FormControl className="w-72">
                    <div className="flex gap-3 items-center">
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={value => field.onChange(value[0])}
                      />
                      <span className="w-16">{field.value}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
export default Gradient;
