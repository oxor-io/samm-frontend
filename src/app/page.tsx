'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// import { safeSDK } from '@/config/SDK';
import { useSAMMStore } from '@/store/sammStore';
import { getSAMMsBySafeAddress } from '@/utils/api';
import { SAMMData } from '@/types/samm';
import { useSafeInfo } from '@/hooks/useSafeInfo';
import LoadingSpinner from '@/components/LoadingSpinner';

import SafeAppsSDK from '@safe-global/safe-apps-sdk';

export default function HomePage() {
  const router = useRouter();
  const fetchSafeInfo = useSafeInfo();

  const isSafeApp = useSAMMStore((state) => state.isSafeApp);
  const setToken = useSAMMStore((state) => state.setToken);
  const setSAMMData = useSAMMStore((state) => state.setSAMMData);
  const setAllSAMMs = useSAMMStore((state) => state.setAllSAMMs);
  const setDisabledSAMMs = useSAMMStore((state) => state.setDisabledSAMMs);

  const handleSafeApp = useCallback(async () => {
    try {
      setDataFromLocalStorage();
      const safeSDK = new SafeAppsSDK();
      const { safeAddress, chainId, modules, isReadOnly } = await safeSDK.safe.getInfo();

      if (isReadOnly) {
        router.replace('/read-only');
        return;
      }

      const sammData = await getSAMMsBySafeAddress(safeAddress, chainId);

      if (!sammData || sammData?.length === 0) {
        router.replace('/create-module');
        return;
      }

      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

      if (!isAuthenticated && !isReadOnly) {
        router.replace('/owners-login');
        return;
      }

      const enabledSAMMModules: SAMMData[] = modules
        ? sammData.filter((data) =>
            modules.some((module) => module.toLowerCase() === data.samm_address.toLowerCase())
          )
        : [];
      const disabledSAMMModules: SAMMData[] = sammData.filter(
        (data) =>
          !enabledSAMMModules.some(
            (enabled) => enabled.samm_address.toLowerCase() === data.samm_address.toLowerCase()
          )
      );

      useSAMMStore.getState().setAllSAMMs(sammData);
      useSAMMStore.getState().setDisabledSAMMs(disabledSAMMModules);

      localStorage.setItem('disabledSAMMs', JSON.stringify(disabledSAMMModules));
      localStorage.setItem('userSamms', JSON.stringify(sammData));

      if (sammData.length === 0) {
        router.replace('/create-module');
        return;
      } else if (
        sammData.length === 1 &&
        enabledSAMMModules.length === 1 &&
        sammData[0].samm_address.toLowerCase() === enabledSAMMModules[0].samm_address.toLowerCase()
      ) {
        setSAMMData(sammData[0]);
        router.replace('/manage/members');
        return;
      } else {
        router.replace('/modules');
        return;
      }
    } catch (error) {
      console.error('Error handling Safe app:', error);
      router.replace('/create-module');
    }
  }, [router, setSAMMData]);

  function setDataFromLocalStorage() {
    const currentSamm = localStorage.getItem('currentSamm');
    const userSamms = localStorage.getItem('userSamms');
    const disabledSAMMs = localStorage.getItem('disabledSAMMs');
    const token = localStorage.getItem('accessToken');
    if (disabledSAMMs) setDisabledSAMMs(JSON.parse(disabledSAMMs));
    if (userSamms) setAllSAMMs(JSON.parse(userSamms));
    if (currentSamm) setSAMMData(JSON.parse(currentSamm));
    if (token) setToken(token);
  }
  useEffect(() => {
    fetchSafeInfo();
  }, [fetchSafeInfo]);

  useEffect(() => {
    if (isSafeApp === null) return;

    if (isSafeApp) {
      handleSafeApp();
    } else {
      router.replace('/authorization');
    }
  }, [isSafeApp, handleSafeApp, router]);

  return <LoadingSpinner full={true} />;
}
