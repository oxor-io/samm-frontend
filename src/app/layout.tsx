import type { Metadata } from 'next';
import Providers from '@/app/providers/Providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'SAMM',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
