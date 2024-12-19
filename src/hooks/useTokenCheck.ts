import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { useSAMMStore } from '@/store/sammStore';
import { showToast } from '@/helpers/showToast';

export function useTokenCheck() {
  const router = useRouter();
  const { toast } = useToast();
  const isSafeApp = useSAMMStore((state) => state.isSafeApp);

  function handleApiError(error: unknown) {
    const errorMessage = (error as Error).message || '';

    if (
      errorMessage.includes('Invalid token') ||
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('No access token found')
    ) {
      localStorage.removeItem('accessToken');
      localStorage.setItem('isAuthenticated', 'false');
      showToast(toast, 'Session expired. Please log in again.', '', 'destructive');
      if (!isSafeApp) {
        router.push('/authorization');
      } else {
        router.push('/');
      }
    } else {
      showToast(toast, `An error occurred: ${errorMessage}`, '', 'destructive');
    }
  }
  return { handleApiError };
}
