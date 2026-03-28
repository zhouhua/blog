import { Form, FormField, FormItem, FormLabel } from '@react/ui/form';
import { Label } from '@react/ui/label';
import { RadioGroup, RadioGroupItem } from '@react/ui/radio-group';
import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

function BlurryTypeField() {
  const form = useForm({
    defaultValues: {
      type: 'type1',
    },
  });

  return (
    <Form {...form}>
      <FormField
        name="type"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex gap-1 items-center h-10">
            <FormLabel className="w-24 shrink-0">Effect Type：</FormLabel>
            <div className="!mt-0">
              <RadioGroup
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="blurry-type-type1" value="type1" />
                  <Label htmlFor="blurry-type-type1" className="font-normal !mt-0">
                    Merge
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="blurry-type-type2" value="type2" />
                  <Label htmlFor="blurry-type-type2" className="font-normal !mt-0">
                    Interlace
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </FormItem>
        )}
      />
    </Form>
  );
}

describe('blurry type field', () => {
  it('renders and switches options without recursive updates', () => {
    render(<BlurryTypeField />);

    const merge = screen.getByLabelText('Merge');
    const interlace = screen.getByLabelText('Interlace');

    expect((merge as HTMLInputElement).checked).toBe(true);
    expect((interlace as HTMLInputElement).checked).toBe(false);

    fireEvent.click(interlace);

    expect((interlace as HTMLInputElement).checked).toBe(true);
    expect((merge as HTMLInputElement).checked).toBe(false);
  });
});
