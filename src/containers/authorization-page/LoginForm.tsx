'use client';

import { z } from 'zod';
import { EyeIcon, EyeOffIcon, RotateCw } from 'lucide-react';
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
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().min(3, 'Email addresses are required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isSubmitting: boolean;
}

export function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function handleFormSubmit(data: LoginFormData) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 gradient-border p-4 rounded-xl hover:shadow-xl shadow-md shadow-samm-green hover:shadow-samm-green transition-shadow duration-500 max-w-lg"
      >
        <h3 className="text-4xl text-samm-white text-center">
          Login to <span className="text-samm-green">SAMM</span> Module
        </h3>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-samm-white">Email Address</FormLabel>
              <FormControl>
                <Input placeholder="email1@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-samm-white">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="password"
                    type={passwordVisibility ? 'text' : 'password'}
                    {...field}
                    required
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    type="button"
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                    onClick={() => setPasswordVisibility((prev) => !prev)}
                  >
                    {passwordVisibility ? <EyeOffIcon /> : <EyeIcon />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button size="lg" className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Log in'
          )}
        </Button>
      </form>
    </Form>
  );
}
