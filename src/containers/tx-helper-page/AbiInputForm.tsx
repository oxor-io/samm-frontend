'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Interface, isAddress } from 'ethers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const validateAbiJson = (data: string) => {
  try {
    Interface.from(data);
    return true;
  } catch {
    return false;
  }
};

const abiSchema = z.object({
  contractAddress: z.string().min(1, 'Contract address is required').refine(isAddress, {
    message: 'Invalid address or ENS',
  }),

  abiJson: z.string().min(1, 'ABI JSON is required').refine(validateAbiJson, {
    message: 'Invalid ABI JSON format. Please ensure it is a valid JSON array.',
  }),
});

export type AbiFormValues = z.infer<typeof abiSchema>;

interface AbiInputFormProps {
  onSubmit: (data: AbiFormValues) => void;
}

export default function AbiInputForm({ onSubmit }: AbiInputFormProps) {
  const form = useForm<AbiFormValues>({
    resolver: zodResolver(abiSchema),
    defaultValues: {
      contractAddress: '',
      abiJson: '',
    },
  });

  const { formState, control, handleSubmit } = form;

  function handleFormSubmit(data: AbiFormValues) {
    if (formState.isValid) {
      onSubmit(data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col space-y-4 mt-4">
        <FormField
          control={control}
          name="contractAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address or ENS name</FormLabel>
              <FormControl>
                <Input
                  disabled={formState.isSubmitting}
                  placeholder="Contract Address"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="abiJson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ABI</FormLabel>
              <FormControl>
                <Textarea
                  disabled={formState.isSubmitting}
                  placeholder="ABI JSON"
                  className="w-full"
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={formState.isSubmitting || !formState.isValid}
        >
          {formState.isSubmitting ? 'Loading...' : 'Load ABI'}
        </Button>
      </form>
    </Form>
  );
}
