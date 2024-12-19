'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useSAMMStore } from '@/store/sammStore';
import { useSafeInfo } from '@/hooks/useSafeInfo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const sammData = useSAMMStore((state) => state.sammData);
  const isSafeApp = useSAMMStore((state) => state.isSafeApp);
  const setSAMMData = useSAMMStore((state) => state.setSAMMData);
  const setAllSAMMs = useSAMMStore((state) => state.setAllSAMMs);
  const setToken = useSAMMStore((state) => state.setToken);
  const fetchSafeInfo = useSafeInfo();

  useEffect(() => {
    setDataFromLocalStorage();
    if (isSafeApp === null) {
      fetchSafeInfo();
    }

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isSafeApp && !isAuthenticated) {
      router.push('/authorization');
    } else if (isSafeApp && !sammData) {
      router.replace('/create-module');
    }
  }, [isSafeApp, router]);

  function setDataFromLocalStorage() {
    const currentSamm = localStorage.getItem('currentSamm');
    const userSamms = localStorage.getItem('userSamms');
    const token = localStorage.getItem('access_token');
    if (userSamms) setAllSAMMs(JSON.parse(userSamms));
    if (currentSamm) setSAMMData(JSON.parse(currentSamm));
    if (token) setToken(JSON.parse(token));
  }

  if (!sammData) return <LoadingSpinner full={true} />;

  return (
    <div className="flex">
      <SidebarProvider>
        <nav>{<DashboardSidebar isSafe={isSafeApp ?? false} />}</nav>
        <main className="flex-1">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
