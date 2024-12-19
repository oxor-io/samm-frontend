import HeaderTabs from '@/components/HeaderTabs';
import { ReactNode } from 'react';

export default function layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <HeaderTabs tabType="tx" />
      <div className="px-8">{children}</div>
    </div>
  );
}
