import { ReactNode } from 'react';
import SafeGuard from '@/components/SafeGuard';
import HeaderTabs from '@/components/HeaderTabs';

export default function layout({ children }: { children: ReactNode }) {
  return (
    <SafeGuard>
      <>
        <HeaderTabs tabType="manage" />
        <div className="px-8">{children}</div>
      </>
    </SafeGuard>
  );
}
