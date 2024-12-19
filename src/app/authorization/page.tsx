'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMemberToken } from '@/utils/api';
import { LoginForm } from '@/containers/authorization-page/LoginForm';
import { showToast } from '@/helpers/showToast';

export default function AuthorizationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      router.replace('/transactions/pending');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setIsSubmitting(true);

    try {
      const response = await getMemberToken(email, password);

      if (response) {
        localStorage.setItem('accessToken', response.access_token);
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/modules');
      } else {
        showToast(toast, `Invalid login credentials. Please try again.`, '', 'destructive');
      }
    } catch (error) {
      console.error('Error during login:', error);
      showToast(toast, `An unexpected error occurred. Please try again later.`, '', 'destructive');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-samm-black">
        <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
      </div>
    );
}
