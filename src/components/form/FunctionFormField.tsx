import { Input } from '@/components/ui/input';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type FunctionFormFieldProps<T extends FieldValues> = {
  input: { name: Path<T>; type: string };
  form: UseFormReturn<T>;
};

export default function FunctionFormField<T extends FieldValues>({
  input,
  form,
}: FunctionFormFieldProps<T>) {
  return (
    <FormField
      key={input.name}
      control={form.control}
      name={input.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{input.name + ` (${input.type})`}</FormLabel>
          <FormControl>
            <Input
              disabled={form.formState.isSubmitting}
              placeholder={input.type}
              className="w-full"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
