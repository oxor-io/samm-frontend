'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { safeSDK } from '@/config/SDK';
import { requestSignature } from '@/utils/safe';
import { useSAMMStore } from '@/store/sammStore';
import { getOwnerToken, getSAMMsBySafeAddress } from '@/utils/api';

import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { setToken } = useSAMMStore();

  const handleLogin = async () => {
    setIsLoggingIn(true);

    try {
      const { safeAddress, chainId, owners } = await safeSDK.safe.getInfo();
      const sammData = await getSAMMsBySafeAddress(safeAddress, chainId);

      if (!sammData || sammData.length === 0) {
        router.replace('/create-module');
        return;
      }

      const signedData = await requestSignature(sammData[0].samm_address, chainId, owners);
      const token = await getOwnerToken(signedData);

      localStorage.setItem('accessToken', token.access_token);
      localStorage.setItem('isAuthenticated', 'true');
      setToken(token.access_token);

      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen min-w-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl">Welcome to SAMM</h1>
      <Button onClick={handleLogin} disabled={isLoggingIn}>
        {isLoggingIn ? 'Logging in...' : 'Log in'}
      </Button>
    </div>
  );
}
