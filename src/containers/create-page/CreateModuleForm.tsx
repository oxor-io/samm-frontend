'use client';

import { z, ZodIssueCode } from 'zod';
import { RotateCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z
  .object({
    moduleName: z.string().optional(),
    emailAddresses: z
      .string()
      .min(3, 'Email addresses are required')
      .refine(
        (val) => {
          const emails = val.split(',').map((email) => email.trim());
          return emails.every((email) => z.string().email().safeParse(email).success);
        },
        { message: 'Please enter valid comma-separated email addresses' }
      )
      .refine(
        (val) => {
          const emails = val.split(',').map((email) => email.trim());
          const uniqueEmails = new Set(emails);
          return uniqueEmails.size === emails.length;
        },
        { message: 'Duplicate email addresses are not allowed' }
      ),

    threshold: z.number().min(1, { message: 'Threshold must be at least 1' }),

    relayerEmail: z.string().email({ message: 'Please enter a valid relayer email address' }),
  })
  .superRefine((data, ctx) => {
    const emailCount = data.emailAddresses.split(',').length;

    if (data.threshold > emailCount) {
      ctx.addIssue({
        path: ['threshold'],
        message: 'Threshold cannot exceed the number of email addresses provided',
        code: ZodIssueCode.not_finite,
      });
    }
  });

export type ModuleFormData = z.infer<typeof formSchema>;

interface ModuleFormProps {
  onSubmit: (data: ModuleFormData) => void;
  isSubmitting: boolean;
}

export function ModuleForm({ onSubmit, isSubmitting }: ModuleFormProps) {
  const form = useForm<ModuleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      threshold: 1,
      relayerEmail: 'samm@oxor.io',
    },
  });

  function handleFormSubmit(data: ModuleFormData) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="lg:w-2/3 space-y-6 gradient-border p-4 rounded-xl hover:shadow-xl shadow-md shadow-samm-green hover:shadow-samm-green transition-shadow duration-500"
      >
        <h3 className="text-4xl text-samm-white text-center">
          Create <span className="text-samm-green">SAMM</span> Module
        </h3>

        <FormField
          control={form.control}
          name="moduleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-samm-white">Module name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Company salaries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emailAddresses"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-samm-white">Email Addresses (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="email1@example.com, email2@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-samm-white">Threshold value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="4"
                  {...field}
                  value={isNaN(field.value) ? '' : field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? NaN : e.target.valueAsNumber)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="relayerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-samm-white">Relayer Email Address</FormLabel>
              <FormControl>
                <Input placeholder="relayer@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button size="lg" className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Creating module...
            </>
          ) : (
            'Create module'
          )}
        </Button>
      </form>
    </Form>
  );
}
