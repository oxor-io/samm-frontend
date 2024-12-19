'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  emails: z
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
});

type AddEmailFormData = z.infer<typeof formSchema>;

interface AddEmailFormProps {
  onAddEmail: (emails: string[]) => void;
  emailList: string[];
}

export default function AddEmailForm({ onAddEmail, emailList }: AddEmailFormProps) {
  const form = useForm<AddEmailFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { emails: '' },
  });

  const onSubmit = async (data: AddEmailFormData) => {
    const newEmails = data.emails.split(',');
    if (newEmails.some((email) => emailList.includes(email))) {
      form.setError('emails', {
        type: 'manual',
        message: 'This email is already in the list.',
      });
      return;
    }
    onAddEmail(newEmails);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-start mt-2 w-full">
        <div className="w-full">
          <FormField
            control={form.control}
            name="emails"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Enter new email (or few emails comma-separated)"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Adding...' : 'Add Email'}
        </Button>
      </form>
    </Form>
  );
}
