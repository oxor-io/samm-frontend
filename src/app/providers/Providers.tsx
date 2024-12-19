'use client';

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import SafeProvider from '@safe-global/safe-apps-react-sdk';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeProvider>
      <Toaster /> {children}
    </SafeProvider>
  );
}
