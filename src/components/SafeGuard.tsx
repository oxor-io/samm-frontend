'use client';

import { ReactNode } from 'react';
import NoPermission from './NoPermission';
import { useSAMMStore } from '@/store/sammStore';

interface SafeGuardProps {
  children: ReactNode;
}

export default function SafeGuard({ children }: SafeGuardProps) {
  const isSafeApp = useSAMMStore((state) => state.isSafeApp);

  if (isSafeApp === null) return <NoPermission />;

  return isSafeApp ? <>{children}</> : <NoPermission />;
}
