import { useCallback } from 'react';
import { safeSDK } from '@/config/SDK';
import { useSAMMStore } from '@/store/sammStore';

export const useSafeInfo = () => {
  const setIsSafeApp = useSAMMStore((state) => state.setIsSafeApp);

  const fetchSafeInfo = useCallback(async () => {
    let didResolve = false;

    const timeout = setTimeout(() => {
      if (!didResolve) setIsSafeApp(false);
    }, 2500);

    try {
      await safeSDK.safe.getInfo();
      didResolve = true;
      setIsSafeApp(true);
    } catch (error) {
      console.error('Safe info fetch failed:', error);
      setIsSafeApp(false);
    } finally {
      clearTimeout(timeout);
    }
  }, [setIsSafeApp]);

  return fetchSafeInfo;
};
